import { REVIEW_CYCLE_MONTHS, tierRequirementsFor, trackForBudget } from "@/data/methodology";
import { CATEGORY_STATUSES, VERIFICATION_TIERS } from "@/data/schema";
import type { CategoryStatus, Organization, VerificationCategoryId, VerificationTier } from "@/data/types";

export function nextTier(tier: VerificationTier): VerificationTier | null {
  const i = VERIFICATION_TIERS.indexOf(tier);
  return VERIFICATION_TIERS.at(i + 1) ?? null;
}

export function orgTrack(org: Organization) {
  return trackForBudget(org.annualBudgetUsd);
}

/** Categories a tier requires for this organization, on its own review track. */
export function requiredFor(org: Organization, tier: VerificationTier): VerificationCategoryId[] {
  return tierRequirementsFor(tier, orgTrack(org));
}

/** Categories still short of "meets standard" for the next tier up, on the organization's track. */
export function categoriesForNextTier(org: Organization): VerificationCategoryId[] {
  const next = nextTier(org.verification.tier);
  if (!next) return [];
  return requiredFor(org, next).filter((id) => org.verification.categories[id] !== "meets-standard");
}

/** The overall tier a set of findings supports on a track. Internal: donors see category findings. */
export function tierForFindings(categories: Organization["verification"]["categories"], track: ReturnType<typeof trackForBudget>): VerificationTier {
  return [...VERIFICATION_TIERS].reverse().find((t) => tierRequirementsFor(t, track).every((id) => categories[id] === "meets-standard"))!;
}

/** One line of category findings, e.g. "4 of 6 categories meet the standard · 1 unable to verify". */
export function findingsSummary(org: Organization): string {
  const parts = statusBreakdown(org)
    .filter((b) => b.status !== "meets-standard")
    .map((b) => `${b.count} ${STATUS_SHORT[b.status]}`);
  return [`${meetsCount(org)} of 6 categories meet the standard`, ...parts].join(" · ");
}

const STATUS_SHORT: Record<CategoryStatus, string> = {
  "meets-standard": "meet the standard",
  "partially-meets": "partially meet",
  "in-review": "in review",
  "does-not-meet": "do not meet",
  "unable-to-verify": "unable to verify",
  "not-assessed": "not assessed",
};

export function meetsCount(org: Organization): number {
  return Object.values(org.verification.categories).filter((s) => s === "meets-standard").length;
}

/** ISO date one review cycle after the last review, or null if never reviewed. */
export function nextReviewDue(lastReviewed: string | null): string | null {
  if (!lastReviewed) return null;
  const [y, m, d] = lastReviewed.split("-").map(Number);
  const months = m - 1 + REVIEW_CYCLE_MONTHS;
  const year = y + Math.floor(months / 12);
  const month = (months % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Count of categories per status, in the order statuses are defined. */
export function statusBreakdown(org: Organization): { status: CategoryStatus; count: number }[] {
  const values = Object.values(org.verification.categories);
  return [...CATEGORY_STATUSES]
    .reverse()
    .map((status) => ({ status, count: values.filter((v) => v === status).length }))
    .filter((entry) => entry.count > 0);
}
