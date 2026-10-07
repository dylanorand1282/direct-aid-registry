import type { FUNDED_BANDS } from "@/data/schema";
import type { Organization, Project } from "@/data/types";

type FundedBand = (typeof FUNDED_BANDS)[number];
import { formatUsd, percentFunded } from "./format";
import { oblastLabel } from "./labels";

// What the public sees of an organization's location and finances. Every
// public page reads these instead of the raw fields, so a withheld value never leaks.

export const WITHHELD_LOCATION = "Withheld for security";
export const WITHHELD_GAP = "Not published";

export const DISCLOSURE_NOTES = {
  location:
    "Organizations working near the front can withhold even the oblasts they work in. Withheld locations stay with reviewers and never enter the public record, so they cannot be shown, filtered on or downloaded.",
  gap: "Organizations can choose not to publish their funding gap. Then exact amounts raised and still needed are withheld from their projects too, and funding is shown only in quarters of each budget, so the gap cannot be worked out from them. Budgets stay public.",
  securityReview:
    "The published list is a draft. Before any real launch, it needs a security review with organizations working near the front.",
};

export function locationsWithheld(org: Organization): boolean {
  return org.disclosure?.locations === "withheld";
}

export function gapWithheld(org: Organization): boolean {
  return org.disclosure?.fundingGap === "withheld";
}

export function publicRegions(org: Organization): string {
  return locationsWithheld(org) ? WITHHELD_LOCATION : org.operatingRegions.map((r) => oblastLabel[r]).join(", ");
}

export function publicHeadquarters(org: Organization): string {
  return locationsWithheld(org) || !org.headquarters ? WITHHELD_LOCATION : `${oblastLabel[org.headquarters]} oblast`;
}

export function publicProjectRegion(project: Project, org: Organization): string {
  return locationsWithheld(org) || !project.region ? WITHHELD_LOCATION : `${oblastLabel[project.region]} oblast`;
}

export function publicGap(org: Organization): string {
  return gapWithheld(org) || org.fundingGapUsd === null ? WITHHELD_GAP : formatUsd(org.fundingGapUsd);
}

const BAND_RANGE: Record<FundedBand, [number, number]> = {
  "under-quarter": [0, 25],
  "quarter-half": [25, 50],
  "half-three-quarters": [50, 75],
  "over-three-quarters": [75, 100],
};

export const FUNDED_BAND_LABEL: Record<FundedBand, string> = {
  "under-quarter": "Less than a quarter funded",
  "quarter-half": "A quarter to half funded",
  "half-three-quarters": "Half to three quarters funded",
  "over-three-quarters": "More than three quarters funded",
};

export const COARSE_FUNDING_NOTE =
  "This organization does not publish its funding gap, so exact amounts raised and still needed are not shown. Funding is shown in quarters of the budget.";

/** The band a project's funding falls in. Used by reviewers to set the public band. */
export function bandFor(raisedUsd: number, targetUsd: number): FundedBand {
  const pct = targetUsd === 0 ? 100 : (raisedUsd / targetUsd) * 100;
  return pct < 25 ? "under-quarter" : pct < 50 ? "quarter-half" : pct < 75 ? "half-three-quarters" : "over-three-quarters";
}

export type ProjectFunding =
  | { exact: true; raisedUsd: number; stillNeededUsd: number; percent: number; maxStillNeededUsd: number }
  | { exact: false; band: FundedBand; label: string; percent: number; maxStillNeededUsd: number };

/**
 * A project's funding as the public may see it. When amounts are withheld, only a
 * band is known, and `maxStillNeededUsd` is the most the project could still need.
 */
export function projectFunding(project: Project): ProjectFunding {
  if (project.raisedUsd !== null) {
    const stillNeededUsd = project.targetUsd - project.raisedUsd;
    return { exact: true, raisedUsd: project.raisedUsd, stillNeededUsd, percent: percentFunded(project.raisedUsd, project.targetUsd), maxStillNeededUsd: stillNeededUsd };
  }
  const band = project.fundedBand ?? "under-quarter";
  const [low, high] = BAND_RANGE[band];
  return {
    exact: false,
    band,
    label: FUNDED_BAND_LABEL[band],
    percent: Math.round((low + high) / 2),
    maxStillNeededUsd: Math.round((project.targetUsd * (100 - low)) / 100),
  };
}

/** Exact amount still needed, or null when it is withheld. */
export function exactStillNeeded(project: Project): number | null {
  return project.raisedUsd === null ? null : project.targetUsd - project.raisedUsd;
}
