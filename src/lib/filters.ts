import { FUNDING_NEEDS, OBLASTS, SECTORS, VERIFICATION_CATEGORIES } from "@/data/schema";
import type { FundingNeed, Oblast, Organization, Sector, VerificationCategoryId } from "@/data/types";
import { locationsWithheld } from "./disclosure";

// Directory filter state, kept in the URL so filtered views can be shared
// and the back button works. Within a facet options are OR'd; facets are AND'd.
// The exception is "meets": an organization must meet the standard in every
// category picked, because donors choose the categories that matter for a grant.
// There is no ranking by need, gap or overall tier: the default order is by name.

export const ORG_SORTS = ["name", "reviewed"] as const;
export type OrgSort = (typeof ORG_SORTS)[number];
export type DirectoryView = "grid" | "list";

export interface OrgFilters {
  q: string;
  region: Oblast[];
  sector: Sector[];
  meets: VerificationCategoryId[];
  need: FundingNeed[];
  sort: OrgSort;
  view: DirectoryView;
}

export type OrgFacet = "region" | "sector" | "meets" | "need";

export const EMPTY_ORG_FILTERS: OrgFilters = {
  q: "",
  region: [],
  sector: [],
  meets: [],
  need: [],
  sort: "name",
  view: "grid",
};

type ParamReader = { get(name: string): string | null };

function readList<T extends string>(params: ParamReader, key: string, allowed: readonly T[]): T[] {
  const raw = params.get(key);
  if (!raw) return [];
  const values = raw.split(",").filter((v): v is T => (allowed as readonly string[]).includes(v));
  return [...new Set(values)];
}

/** Unknown or malformed values are dropped rather than breaking the page. */
export function parseOrgFilters(params: ParamReader): OrgFilters {
  const sort = params.get("sort");
  return {
    q: (params.get("q") ?? "").trim().slice(0, 100),
    region: readList(params, "region", OBLASTS),
    sector: readList(params, "sector", SECTORS),
    meets: readList(params, "meets", VERIFICATION_CATEGORIES),
    need: readList(params, "need", FUNDING_NEEDS),
    sort: (ORG_SORTS as readonly string[]).includes(sort ?? "") ? (sort as OrgSort) : "name",
    view: params.get("view") === "list" ? "list" : "grid",
  };
}

/** Only non-default values are written, so the plain URL stays clean. */
export function serializeOrgFilters(filters: OrgFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const facet of ["region", "sector", "meets", "need"] as const) {
    if (filters[facet].length) params.set(facet, filters[facet].join(","));
  }
  if (filters.sort !== "name") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);
  return params.toString();
}

function matchesQuery(org: Organization, q: string): boolean {
  if (!q) return true;
  const haystack = [org.name, org.nameUk, org.summary, org.mission, ...org.programs.map((p) => p.name)]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

function matches(org: Organization, filters: OrgFilters, skip?: OrgFacet): boolean {
  const anyOf = <T,>(selected: T[], values: T[]) => selected.length === 0 || selected.some((v) => values.includes(v));
  return (
    matchesQuery(org, filters.q) &&
    // Withheld locations are never matched, so a filter cannot reveal them.
    (skip === "region" || anyOf(filters.region, locationsWithheld(org) ? [] : org.operatingRegions)) &&
    (skip === "sector" || anyOf(filters.sector, org.sectors)) &&
    (skip === "meets" || filters.meets.every((id) => org.verification.categories[id] === "meets-standard")) &&
    (skip === "need" || anyOf(filters.need, [org.fundingNeed]))
  );
}

const comparators: Record<OrgSort, (a: Organization, b: Organization) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  // Most recently reviewed first; never-reviewed organizations last, by name.
  reviewed: (a, b) =>
    (b.verification.lastReviewed ?? "").localeCompare(a.verification.lastReviewed ?? "") || a.name.localeCompare(b.name),
};

export function filterOrganizations(orgs: Organization[], filters: OrgFilters): Organization[] {
  return orgs.filter((org) => matches(org, filters)).sort(comparators[filters.sort]);
}

/**
 * How many organizations an option would show, given every other active filter.
 * Ignores the option's own facet so counts don't collapse to zero once one is picked.
 */
export function facetCount(orgs: Organization[], filters: OrgFilters, facet: OrgFacet, value: string): number {
  return orgs.filter((org) => {
    if (!matches(org, filters, facet)) return false;
    switch (facet) {
      case "region":
        return !locationsWithheld(org) && org.operatingRegions.includes(value as Oblast);
      case "sector":
        return org.sectors.includes(value as Sector);
      case "meets":
        // Counts include the other picked categories, since "meets" is an AND.
        return filters.meets.every((id) => org.verification.categories[id] === "meets-standard") &&
          org.verification.categories[value as VerificationCategoryId] === "meets-standard";
      case "need":
        return org.fundingNeed === value;
    }
  }).length;
}

export function activeFilterCount(filters: OrgFilters): number {
  return (filters.q ? 1 : 0) + filters.region.length + filters.sector.length + filters.meets.length + filters.need.length;
}
