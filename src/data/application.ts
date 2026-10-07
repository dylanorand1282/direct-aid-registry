import { OBLASTS, SECTORS } from "./schema";
import type { VerificationCategoryId } from "./types";
import { VERIFICATION_CATEGORY_DEFINITIONS, type ReviewTrack } from "./methodology";
import { oblastLabel, sectorLabel } from "@/lib/labels";

// The application is the intake side of the verification standard. Every
// question says why it is asked, which category it supports and who will see
// the answer. Nothing here is sent anywhere: drafts stay in the browser.

/** "published" answers appear on the profile; "private" answers are seen only by reviewers. */
export type FieldVisibility = "published" | "private";

export const VISIBILITY_LABEL: Record<FieldVisibility, string> = {
  published: "Published on profile",
  private: "Private: reviewers only",
};

export type SelfAnswer = "yes" | "partly" | "no" | "not-sure";

export const SELF_ANSWER_OPTIONS: { value: SelfAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not sure yet" },
];

export type EvidenceAvailability = "have" | "can-obtain" | "cannot-obtain";

export const EVIDENCE_OPTIONS: { value: EvidenceAvailability; label: string }[] = [
  { value: "have", label: "We have this" },
  { value: "can-obtain", label: "We can obtain it" },
  { value: "cannot-obtain", label: "We cannot obtain it" },
];

// Reasons an organization may be unable to provide evidence. Each one leads to
// an alternative evidence route, never to "Does not meet standard".
export const CANNOT_OBTAIN_REASONS = [
  { value: "destroyed", label: "Records destroyed or damaged" },
  { value: "occupied", label: "Records held in occupied territory" },
  { value: "registry", label: "Registry or issuing office unavailable" },
  { value: "security", label: "Unsafe to visit or collect" },
  { value: "other", label: "Another reason" },
] as const;

interface FieldBase {
  id: string;
  label: string;
  /** Why the platform asks: shown next to every question. */
  why: string;
  supports: VerificationCategoryId | null;
  visibility: FieldVisibility;
  /** Required before the draft can be marked ready. Most questions are optional. */
  required?: boolean;
  hint?: string;
  /** Review tracks that ask this question. Omitted means every track. */
  tracks?: ReviewTrack[];
}

export type ApplicationField =
  | (FieldBase & { kind: "text" | "textarea" })
  | (FieldBase & { kind: "number" })
  | (FieldBase & { kind: "select" | "multi"; options: { value: string; label: string }[] })
  | (FieldBase & { kind: "answer" })
  | (FieldBase & { kind: "evidence"; evidenceFor: VerificationCategoryId })
  | (FieldBase & { kind: "ack" });

export interface ApplicationSection {
  id: string;
  title: string;
  lead: string;
  supports: VerificationCategoryId | null;
  fields: ApplicationField[];
}

const oblastOptions = OBLASTS.map((value) => ({ value, label: oblastLabel[value] }));
const sectorOptions = SECTORS.map((value) => ({ value, label: sectorLabel[value] }));

const NOT_LIGHT: ReviewTrack[] = ["standard", "full"];

// The few evidence items the light track asks for, by index in the standard's list.
const LIGHT_TRACK_EVIDENCE: Partial<Record<VerificationCategoryId, number[]>> = {
  "legal-registration": [0],
  governance: [2],
  "financial-controls": [1],
  safeguarding: [0],
};

function evidenceFields(): ApplicationField[] {
  return VERIFICATION_CATEGORY_DEFINITIONS.flatMap((category) =>
    category.evidence.map((item, i) => ({
      tracks: LIGHT_TRACK_EVIDENCE[category.id]?.includes(i) ? undefined : NOT_LIGHT,
      id: `evidence.${category.id}.${i}`,
      kind: "evidence" as const,
      label: item,
      evidenceFor: category.id,
      supports: category.id,
      visibility: "private" as const,
      why: `Listed in the standard as evidence for ${category.name.toLowerCase()}. Documents are shared with reviewers during review and are never published.`,
    })),
  );
}

export const APPLICATION_SECTIONS: ApplicationSection[] = [
  {
    id: "start",
    title: "Before you start",
    lead: "What applying means, and what it does not.",
    supports: null,
    fields: [
      {
        id: "ack.noGuarantee",
        kind: "ack",
        label: "I understand that applying does not guarantee verification, a tier, a listing on Current Needs, or any funding.",
        why: "Applying starts a review. The outcome depends on the evidence, and funders decide independently.",
        supports: null,
        visibility: "private",
        required: true,
      },
      {
        id: "ack.selfDeclared",
        kind: "ack",
        label: "I understand that answers on this form are self-declared and cannot by themselves support Meets standard.",
        why: "The standard grades form answers as grade D evidence. Reviewers check them against independent sources.",
        supports: null,
        visibility: "private",
        required: true,
      },
      {
        id: "ack.prototype",
        kind: "ack",
        label: "I understand this is a prototype. I will use made-up details, and nothing I enter is sent to anyone.",
        why: "This prototype does not collect real organization data or documents. Drafts stay in this browser.",
        supports: null,
        visibility: "private",
        required: true,
      },
      {
        id: "budgetBand",
        kind: "select",
        label: "Annual budget, last financial year",
        options: [
          { value: "under-50k", label: "Under $50,000" },
          { value: "50-150k", label: "$50,000 to $150,000" },
          { value: "150k-1m", label: "$150,000 to $1 million" },
          { value: "over-1m", label: "Over $1 million" },
        ],
        why: "Sets your review track, so a small group is not asked for what a large organization is. Published as a band, not an exact figure.",
        supports: "financial-controls",
        visibility: "published",
      },
      {
        id: "track",
        kind: "select",
        label: "Review track",
        hint: "Leave unset to use the track that fits your budget. Choose a heavier track only if a funder needs it.",
        options: [
          { value: "light", label: "Light: under $150,000 a year" },
          { value: "standard", label: "Standard: $150,000 to $1 million" },
          { value: "full", label: "Full: over $1 million, or grants over $250,000" },
        ],
        why: "Each track asks only what is proportionate. Categories outside your track are not reviewed and are never counted against you.",
        supports: null,
        visibility: "published",
      },
    ],
  },
  {
    id: "identity",
    title: "Legal identity",
    lead: "Reviewers check these details directly against the Unified State Register.",
    supports: "legal-registration",
    fields: [
      {
        id: "legalName",
        kind: "text",
        label: "Registered name of the organization",
        why: "Must match the register exactly. Mismatches are a listed red flag.",
        supports: "legal-registration",
        visibility: "published",
        required: true,
      },
      {
        id: "legalForm",
        kind: "select",
        label: "Legal form",
        options: [
          { value: "charitable-organization", label: "Charitable organization" },
          { value: "public-organization", label: "Public organization (NGO)" },
          { value: "charitable-foundation", label: "Charitable foundation" },
          { value: "public-union", label: "Public union" },
          { value: "other", label: "Other non-profit form" },
        ],
        why: "Confirms the organization is a non-profit legal entity, the first criterion for legal registration.",
        supports: "legal-registration",
        visibility: "published",
        required: true,
      },
      {
        id: "registrationCode",
        kind: "text",
        label: "Registration code",
        hint: "Prototype: enter a made-up code, not a real one.",
        why: "Lets reviewers find the organization in the register themselves rather than rely on a copy you send.",
        supports: "legal-registration",
        visibility: "private",
      },
      {
        id: "yearRegistered",
        kind: "number",
        label: "Year registered",
        why: "Shown on the profile so funders can see how long the organization has existed.",
        supports: "legal-registration",
        visibility: "published",
      },
      {
        id: "signatoryChange",
        kind: "answer",
        label: "Have your director or authorised signatories changed in the last 12 months?",
        why: "Recent, unexplained changes are a red flag the reviewer will ask about. A change with a clear reason is normal.",
        supports: "legal-registration",
        visibility: "private",
      },
    ],
  },
  {
    id: "operations",
    title: "Where and how you work",
    lead: "Locations are published only at oblast level. Exact sites are never published.",
    supports: "operational-capacity",
    fields: [
      {
        id: "oblasts",
        kind: "multi",
        label: "Oblasts where you currently deliver work",
        options: oblastOptions,
        why: "Shown on the profile and used to match you with funders, unless you withhold it below. Moving into a new oblast later is a material change.",
        supports: "operational-capacity",
        visibility: "published",
        required: true,
      },
      {
        id: "locationDisclosure",
        kind: "select",
        label: "What to publish about where you work",
        hint: "Nothing more precise than oblast level is ever published.",
        options: [
          { value: "oblast", label: "Publish the oblasts where we work" },
          { value: "withheld", label: "Withhold even the oblasts, for security" },
        ],
        why: "Organizations working near the front may not want to show where they operate. Reviewers still see your oblasts; donors and the public do not, and they are never used in filters.",
        supports: null,
        visibility: "private",
      },
      {
        id: "gapDisclosure",
        kind: "select",
        label: "Publish your funding gap?",
        options: [
          { value: "published", label: "Yes, publish it" },
          { value: "withheld", label: "No, keep it private" },
        ],
        why: "A public funding gap helps donors size their support, but it also shows how stretched you are. You can withhold it; pledges still work.",
        supports: null,
        visibility: "private",
      },
      {
        id: "sectors",
        kind: "multi",
        label: "Sectors",
        options: sectorOptions,
        why: "Shown on the profile and used in the directory filters.",
        supports: null,
        visibility: "published",
        required: true,
      },
      {
        id: "summary",
        kind: "textarea",
        label: "What your organization does, in a few sentences",
        hint: "Ukrainian or English. Reviewers work in Ukrainian; a translation is prepared for the profile and shown to you first.",
        why: "Becomes the profile overview after you approve it. Keep it factual: who you serve, where, and how.",
        supports: null,
        visibility: "published",
        required: true,
      },
      {
        id: "staffCount",
        kind: "number",
        label: "Paid staff",
        why: "Part of the staffing structure reviewers compare with the scale of work you propose.",
        supports: "operational-capacity",
        visibility: "published",
      },
      {
        id: "volunteerCount",
        kind: "number",
        label: "Regular volunteers",
        why: "Many front-line organizations rely on volunteers. This is not counted against you.",
        supports: "operational-capacity",
        visibility: "published",
      },
      {
        id: "siteAccess",
        tracks: NOT_LIGHT,
        kind: "select",
        label: "Can a reviewer safely visit where you work?",
        options: [
          { value: "yes", label: "Yes, most sites can be visited" },
          { value: "some", label: "Some sites cannot be visited safely" },
          { value: "no", label: "Visits would not be safe" },
        ],
        why: "Lets reviewers plan a live remote walkthrough or a vetted field partner instead. An unsafe visit is never counted against you.",
        supports: "operational-capacity",
        visibility: "private",
      },
    ],
  },
  {
    id: "governance",
    title: "Governance",
    lead: "Only the resulting status and the reviewer's note are published, not these answers.",
    supports: "governance",
    fields: [
      {
        id: "boardSize",
        kind: "number",
        label: "Members of your board or supervisory body",
        why: "The standard asks for at least three people separate from day-to-day management.",
        supports: "governance",
        visibility: "private",
      },
      {
        id: "boardSeparate",
        tracks: NOT_LIGHT,
        kind: "answer",
        label: "Is the board separate from the people who manage daily work?",
        why: "Separation is what makes leadership accountable. Reviewers will interview one board member who is not in management.",
        supports: "governance",
        visibility: "private",
      },
      {
        id: "communityRoute",
        kind: "answer",
        tracks: ["light"],
        label: "Do at least two named people share responsibility for decisions, and are decisions written down?",
        why: "The light track's community-group route to governance, for groups without a separate board of three.",
        supports: "governance",
        visibility: "private",
      },
      {
        id: "coiPolicy",
        tracks: NOT_LIGHT,
        kind: "answer",
        label: "Do you have a conflict-of-interest policy, with signed declarations?",
        why: "Required criterion. If you do not have one yet, the standard's template can be adopted before review.",
        supports: "governance",
        visibility: "private",
      },
      {
        id: "paymentSeparation",
        kind: "answer",
        label: "Do different people authorise payments and make them?",
        why: "No single person may both authorise and make a payment. Small teams can meet this with a second sign-off.",
        supports: "governance",
        visibility: "private",
      },
    ],
  },
  {
    id: "finance",
    title: "Financial controls",
    lead: "A sample of transactions is reconciled during review. This is not an audit.",
    supports: "financial-controls",
    fields: [
      {
        id: "bankInOrgName",
        kind: "answer",
        label: "Is your bank account held in the organization's own name?",
        why: "Funds sent to personal accounts cannot be traced to the organization. Reviewers confirm this with a bank-issued document.",
        supports: "financial-controls",
        visibility: "private",
      },
      {
        id: "statements",
        tracks: NOT_LIGHT,
        kind: "select",
        label: "Most recent financial statements",
        options: [
          { value: "audited", label: "Externally audited" },
          { value: "unaudited", label: "Prepared but not audited" },
          { value: "none", label: "None prepared yet" },
        ],
        why: "An audit is not required. Unaudited statements are reconciled against bank records instead.",
        supports: "financial-controls",
        visibility: "private",
      },
      {
        id: "procurementPolicy",
        tracks: NOT_LIGHT,
        kind: "answer",
        label: "Do you have a written procurement policy?",
        why: "Shows how suppliers are chosen and quotes compared, which is where diversion most often happens.",
        supports: "financial-controls",
        visibility: "private",
      },
    ],
  },
  {
    id: "safeguarding",
    title: "Safeguarding",
    lead: "Reviewers test whether your complaints channel actually works.",
    supports: "safeguarding",
    fields: [
      {
        id: "safeguardingPolicy",
        kind: "answer",
        label: "Do you have a safeguarding and PSEA policy that staff and volunteers have signed?",
        why: "Required criterion. Protection from sexual exploitation and abuse applies to every sector.",
        supports: "safeguarding",
        visibility: "private",
      },
      {
        id: "complaintsChannel",
        kind: "answer",
        label: "Can the people you serve raise a complaint without going through the staff who help them?",
        why: "An independent channel is what lets problems surface. Reviewers send a test message through it.",
        supports: "safeguarding",
        visibility: "private",
      },
      {
        id: "focalPoint",
        kind: "answer",
        label: "Is a named person responsible for safeguarding?",
        why: "Reviewers interview this person. Their name is never published.",
        supports: "safeguarding",
        visibility: "private",
      },
    ],
  },
  {
    id: "track-record",
    title: "Reporting track record",
    lead: "Past reports are checked against primary records, not taken at face value.",
    supports: "reporting-track-record",
    fields: [
      {
        id: "completedProjects",
        tracks: NOT_LIGHT,
        kind: "number",
        label: "Donor-funded projects completed in the last three years",
        why: "The standard needs at least two completed projects with reports to assess this category. Fewer is fine; the category stays Not assessed.",
        supports: "reporting-track-record",
        visibility: "published",
      },
      {
        id: "reportsOnTime",
        tracks: NOT_LIGHT,
        kind: "answer",
        label: "Were reports to past funders delivered on time?",
        why: "Timeliness is one of the three things checked. Delays with a recorded reason are treated differently from silence.",
        supports: "reporting-track-record",
        visibility: "private",
      },
      {
        id: "recordsMatch",
        tracks: NOT_LIGHT,
        kind: "answer",
        label: "Could reported figures be matched to delivery records, such as distribution lists?",
        why: "Reviewers check a sample of reported figures. Personal data in those records stays private.",
        supports: "reporting-track-record",
        visibility: "private",
      },
    ],
  },
  {
    id: "evidence",
    title: "Evidence plan",
    lead: "Tell us what you can provide. Do not attach anything: in a real review, documents are shared through a secure channel, and this prototype accepts no files.",
    supports: null,
    fields: evidenceFields(),
  },
  {
    id: "working",
    title: "Working with reviewers",
    lead: "So the review fits your circumstances rather than the other way round.",
    supports: null,
    fields: [
      {
        id: "language",
        kind: "select",
        label: "Preferred language for the review",
        options: [
          { value: "uk", label: "Ukrainian" },
          { value: "en", label: "English" },
          { value: "either", label: "Either" },
        ],
        why: "Reviewers work in Ukrainian. You never need to translate documents into English.",
        supports: null,
        visibility: "private",
      },
      {
        id: "constraints",
        kind: "textarea",
        label: "Anything that limits when or how you can respond",
        hint: "For example power cuts, connectivity, a small team, or staff who are also on the front line.",
        why: "Deadlines are set around these constraints. They are never published or counted against you.",
        supports: null,
        visibility: "private",
      },
    ],
  },
];

export const REVIEW_SECTION = { id: "review", title: "Review and submit" } as const;

export const ALL_FIELDS: ApplicationField[] = APPLICATION_SECTIONS.flatMap((s) => s.fields);

export const APPLICATION_NOTICES = {
  storage:
    "Your draft is saved automatically in this browser only. You can close the page and come back later, including after losing connection. Nothing is sent to the platform or to reviewers.",
  storageUnavailable:
    "This browser is not allowing the draft to be saved. Your answers will be lost if you close the page.",
  submitted:
    "Marked as submitted in this browser only. In this prototype nothing is sent, no review starts and no organization is listed.",
  noGuarantee:
    "Applying does not guarantee verification, a tier, a listing on Current Needs, or funding. Applicants are listed as Applied, and no category is shown as met until reviewers have checked independent evidence.",
} as const;

export const SIMULATED_APPLICATION_PREFIX = "APP-SIM";

/** A complete fictional example so the flow can be demonstrated. */
export const EXAMPLE_ANSWERS: Record<string, string | number | string[] | boolean> = {
  "ack.noGuarantee": true,
  "ack.selfDeclared": true,
  "ack.prototype": true,
  legalName: "Sunflower Field Kitchens (fictional)",
  legalForm: "charitable-organization",
  registrationCode: "00000000",
  yearRegistered: 2022,
  signatoryChange: "no",
  oblasts: ["mykolaiv", "kherson"],
  sectors: ["food-security"],
  summary:
    "Fictional example. Runs two community kitchens and delivers hot meals to older people in villages along the Kherson–Mykolaiv road.",
  staffCount: 6,
  volunteerCount: 40,
  siteAccess: "some",
  boardSize: 3,
  boardSeparate: "yes",
  coiPolicy: "partly",
  paymentSeparation: "yes",
  budgetBand: "150k-1m",
  bankInOrgName: "yes",
  statements: "unaudited",
  procurementPolicy: "no",
  safeguardingPolicy: "partly",
  complaintsChannel: "not-sure",
  focalPoint: "yes",
  completedProjects: 1,
  reportsOnTime: "yes",
  recordsMatch: "partly",
  "evidence.legal-registration.0": "have",
  "evidence.legal-registration.1": "have",
  "evidence.legal-registration.2": "have",
  "evidence.governance.0": "have",
  "evidence.governance.1": "can-obtain",
  "evidence.governance.2": "have",
  "evidence.financial-controls.0": "have",
  "evidence.financial-controls.1": "have",
  "evidence.financial-controls.2": "can-obtain",
  "evidence.operational-capacity.0": "have",
  "evidence.operational-capacity.1": "cannot-obtain",
  "evidence.operational-capacity.1.reason": "security",
  "evidence.operational-capacity.2": "have",
  language: "uk",
  constraints: "Fictional example. Daily power cuts; the coordinator answers in the evenings.",
};
