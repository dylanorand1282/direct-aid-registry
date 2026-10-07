import {
  TIER_MEANING,
  STANDARD_VERSION,
  STATUS_DEFINITIONS,
  VERIFICATION_CATEGORY_DEFINITIONS,
  VERIFICATION_IS_NOT,
  REGISTRY_PRINCIPLE,
  REVIEW_TRACKS,
  trackForBudget,
} from "@/data/methodology";
import type { Organization, VerificationCategoryId } from "@/data/types";
import { verificationEvents } from "@/data/verificationEvents";
import { categoryLabel, categoryStatusLabel, tierLabel } from "@/lib/labels";
import { getOrgRecordId } from "@/lib/queries";
import { nextReviewDue } from "@/lib/verification";
import { DEMO_PUBLIC_KEY_RAW_BASE64 } from "./demoKey";
import { ed25519PublicKeyMultibase } from "./canonical";

// The portable due-diligence record. The organization owns it and can share it
// with anyone; checking it needs no access to this website. Its shape follows
// the W3C Verifiable Credentials Data Model 2.0, and its proof follows the
// eddsa-jcs-2022 cryptosuite, so standard tools can read and check it.
// The prototype has not been tested against either specification's test suite.

export const RECORD_FORMAT_VERSION = "0.1";
// ".example" is reserved for documentation (RFC 2606), so these never resolve to a real party.
export const REGISTRY_BASE_URL = "https://direct-aid-registry.example";
export const ISSUER_ID = "did:web:direct-aid-registry.example";
export const VERIFICATION_METHOD_ID = `${ISSUER_ID}#review-key-1`;

export function publicKeyMultibase(): string {
  const raw = Uint8Array.from(atob(DEMO_PUBLIC_KEY_RAW_BASE64), (c) => c.charCodeAt(0));
  return ed25519PublicKeyMultibase(raw);
}

/** How each category's finding compares with existing frameworks, at topic level only. */
export const FRAMEWORK_MAPPINGS: Record<VerificationCategoryId, { framework: string; topic: string }[]> = {
  "legal-registration": [
    { framework: "Unified State Register of Ukraine (org-id.guide UA-EDR)", topic: "Registration and identification code" },
    { framework: "Charter for Change harmonised due diligence passport", topic: "Legal status and registration" },
  ],
  governance: [{ framework: "Charter for Change harmonised due diligence passport", topic: "Governance and leadership" }],
  "financial-controls": [
    { framework: "Charter for Change harmonised due diligence passport", topic: "Financial management" },
    { framework: "Core Humanitarian Standard", topic: "Resources are managed responsibly" },
  ],
  "operational-capacity": [{ framework: "Charter for Change harmonised due diligence passport", topic: "Operational capacity" }],
  safeguarding: [
    { framework: "Charter for Change harmonised due diligence passport", topic: "Safeguarding and PSEA" },
    { framework: "Core Humanitarian Standard", topic: "Complaints are welcomed and addressed" },
  ],
  "reporting-track-record": [
    { framework: "Charter for Change harmonised due diligence passport", topic: "Reporting and accountability" },
  ],
};

export const MAPPING_STATUS =
  "Draft topic-level mapping. Not yet confirmed against the frameworks' current texts or agreed with their owners.";

// Illustrative reviewer IDs. Real records would name accredited reviewers by a
// stable pseudonymous ID that the Integrity Officer can resolve.
function reviewerId(slug: string, salt: number): string {
  let h = salt;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return `REV-${String((h % 90) + 10)}`;
}

function evidenceBasis(org: Organization, id: VerificationCategoryId): string {
  const status = org.verification.categories[id];
  if (status === "meets-standard") return "Grade A, B or C evidence for every criterion";
  if (status === "partially-meets") return "Some criteria supported by grade A, B or C evidence";
  if (status === "unable-to-verify") return "No acceptable evidence could be obtained";
  if (status === "in-review") return "Evidence submitted, assessment in progress";
  if (status === "does-not-meet") return "Evidence reviewed; criteria not satisfied";
  return "Not assessed";
}

export function buildUnsignedRecord(org: Organization, asOf?: string) {
  const recordId = getOrgRecordId(org.slug);
  const events = verificationEvents
    .filter((e) => e.orgSlug === org.slug && (!asOf || e.date <= asOf))
    .sort((a, b) => a.date.localeCompare(b.date));
  const issuedOn = org.verification.lastReviewed ?? events.at(-1)?.date ?? null;
  const due = nextReviewDue(org.verification.lastReviewed);
  const unable = VERIFICATION_CATEGORY_DEFINITIONS.filter((c) => org.verification.categories[c.id] === "unable-to-verify");

  return {
    "@context": ["https://www.w3.org/ns/credentials/v2", `${REGISTRY_BASE_URL}/contexts/due-diligence-record/v${RECORD_FORMAT_VERSION}`],
    type: ["VerifiableCredential", "DueDiligenceRecord"],
    id: `urn:dar:record:${recordId}:${issuedOn ?? "applied"}`,
    name: `Due-diligence record for ${org.name}`,
    description: REGISTRY_PRINCIPLE,
    issuer: { id: ISSUER_ID, name: "Direct Aid Registry review function (prototype)" },
    ...(issuedOn && { validFrom: `${issuedOn}T00:00:00Z` }),
    ...(due && { validUntil: `${due}T00:00:00Z` }),
    // A simplified stand-in for a W3C status list entry: where anyone can read
    // the record's current status, including suspensions made after signing.
    credentialStatus: {
      id: `${REGISTRY_BASE_URL}/organizations/${org.slug}/status.json`,
      type: "DueDiligenceRecordStatus",
    },
    credentialSubject: {
      id: `urn:dar:org:${recordId}`,
      name: org.name,
      nameUk: org.nameUk,
      isFictional: true,
      identifier: [{ scheme: "UA-EDR", value: `FICTIONAL-${recordId}`, note: "Fictional organization. There is no real register entry." }],
      standard: {
        name: "Direct Aid Registry verification standard",
        version: STANDARD_VERSION,
        url: `${REGISTRY_BASE_URL}/methodology`,
        governance: "Proposed for ratification by a Ukrainian-led Standards Council. Not yet ratified.",
      },
      tier: {
        id: org.verification.tier,
        label: tierLabel[org.verification.tier],
        tellsYou: TIER_MEANING[org.verification.tier].tellsYou,
        doesNotTellYou: TIER_MEANING[org.verification.tier].doesNotTellYou,
      },
      reviewTrack: {
        id: trackForBudget(org.annualBudgetUsd),
        name: REVIEW_TRACKS[trackForBudget(org.annualBudgetUsd)].name,
        categoriesReviewed: REVIEW_TRACKS[trackForBudget(org.annualBudgetUsd)].categories,
        note: "Categories outside the track are not reviewed and show as Not assessed. That is not a finding.",
      },
      lastReviewed: org.verification.lastReviewed,
      nextReviewDue: due,
      categories: VERIFICATION_CATEGORY_DEFINITIONS.map((c) => {
        const status = org.verification.categories[c.id];
        return {
          id: c.id,
          name: categoryLabel[c.id],
          status,
          statusLabel: categoryStatusLabel[status],
          statusMeaning: STATUS_DEFINITIONS[status].meaning,
          reviewerNote: org.verification.notes[c.id] ?? null,
          evidenceBasis: evidenceBasis(org, c.id),
          method: c.method,
          limit: c.limit,
          mappings: FRAMEWORK_MAPPINGS[c.id],
        };
      }),
      unableToVerify: unable.map((c) => ({
        category: c.id,
        reason: org.verification.notes[c.id] ?? "Reason recorded by the reviewer.",
        isFindingAgainstOrganization: false,
      })),
      history: events.map(({ date, kind, summary, ...rest }) => ({
        date,
        kind,
        summary,
        ...("category" in rest && { category: rest.category, from: rest.from, to: rest.to }),
        ...("toTier" in rest && { fromTier: rest.fromTier, toTier: rest.toTier }),
        ...("tier" in rest && { tier: rest.tier }),
      })),
      mappingStatus: MAPPING_STATUS,
    },
    evidence: [
      {
        type: ["ReviewProvenance"],
        leadReviewer: reviewerId(org.slug, 7),
        secondReviewer: reviewerId(org.slug, 13),
        reviewerIdsAreIllustrative: true,
        conflictsDeclared: "None declared",
        underlyingDocuments:
          "Held by the organization. Documents are reviewed but never included in this record or published.",
      },
    ],
    termsOfUse: [
      {
        type: "DueDiligenceRecordTerms",
        owner: org.name,
        ownership:
          "This record belongs to the organization it describes. It may share it with any funder, on or off the registry, and keep it after leaving the registry.",
        notAnEndorsement: VERIFICATION_IS_NOT.map((n) => n.title),
        currentStatus: `Statuses can be suspended between reviews. Confirm the current status at ${REGISTRY_BASE_URL}/organizations/${org.slug} before relying on this copy.`,
        prototype:
          "Prototype data. The organization is fictional, and the signing key is a public demonstration key, so the signature shows the mechanism but proves nothing.",
      },
    ],
  };
}

export type UnsignedRecord = ReturnType<typeof buildUnsignedRecord>;
