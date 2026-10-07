import type { CategoryStatus, Organization, VerificationCategoryId } from "@/data/types";
import { VERIFICATION_CATEGORIES } from "@/data/schema";
import { RECORDS_AS_OF, verificationEvents } from "@/data/verificationEvents";
import { getOrgRecordId } from "@/lib/queries";
import { REGISTRY_BASE_URL } from "./record";

// Current status of a record, published separately from the signed copy so a
// funder can tell whether a copy is still current. Unsigned here: a real
// registry would sign it, or publish a W3C Bitstring Status List.

export interface CurrentStatus {
  recordId: string;
  asOf: string;
  suspended: boolean;
  lastReviewed: string | null;
  categories: Record<VerificationCategoryId, CategoryStatus>;
}

export function currentStatus(org: Organization): CurrentStatus {
  return {
    recordId: getOrgRecordId(org.slug),
    asOf: RECORDS_AS_OF,
    suspended: false,
    lastReviewed: org.verification.lastReviewed,
    categories: org.verification.categories,
  };
}

/** The local path for a record's status URL, so the prototype can fetch it from this site. */
export function statusPath(statusUrl: string): string | null {
  return statusUrl.startsWith(`${REGISTRY_BASE_URL}/`) ? statusUrl.slice(REGISTRY_BASE_URL.length) : null;
}

/**
 * The organization as it stood on an earlier date: category changes after that
 * date are undone using the published history. Used to issue example copies
 * that have since expired or gone out of date.
 */
export function organizationAsOf(org: Organization, date: string, lastReviewed: string): Organization {
  const categories = { ...org.verification.categories };
  const later = verificationEvents
    .filter((e) => e.orgSlug === org.slug && e.date > date && e.kind === "category-change")
    .sort((a, b) => b.date.localeCompare(a.date));
  for (const e of later) if (e.kind === "category-change") categories[e.category] = e.from;
  return { ...org, verification: { ...org.verification, lastReviewed, categories } };
}

export type Currency =
  | { kind: "current" }
  | { kind: "expired"; validUntil: string }
  | { kind: "not-yet-valid"; validFrom: string }
  | { kind: "suspended" }
  | { kind: "changed"; changes: { category: VerificationCategoryId; signed: string; now: CategoryStatus }[] }
  | { kind: "unknown"; reason: string };

/** Whether an unaltered copy can still be relied on today. Expiry outranks a status change. */
export function assessCurrency(
  record: { validFrom?: string; validUntil?: string; credentialSubject?: { categories?: { id: string; status: string }[] } },
  status: CurrentStatus | null,
  today: string = RECORDS_AS_OF,
): Currency {
  if (record.validUntil && record.validUntil.slice(0, 10) < today) return { kind: "expired", validUntil: record.validUntil.slice(0, 10) };
  if (record.validFrom && record.validFrom.slice(0, 10) > today) return { kind: "not-yet-valid", validFrom: record.validFrom.slice(0, 10) };
  if (!status) return { kind: "unknown", reason: "The current status could not be loaded." };
  if (status.suspended) return { kind: "suspended" };
  const signed = new Map((record.credentialSubject?.categories ?? []).map((c) => [c.id, c.status]));
  const changes = VERIFICATION_CATEGORIES.filter((id) => signed.get(id) !== status.categories[id]).map((id) => ({
    category: id,
    signed: signed.get(id) ?? "missing",
    now: status.categories[id],
  }));
  return changes.length ? { kind: "changed", changes } : { kind: "current" };
}
