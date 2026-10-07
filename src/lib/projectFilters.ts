import { OBLASTS, SECTORS, VERIFICATION_CATEGORIES } from "@/data/schema";
import type { Oblast, Organization, Project, Sector, VerificationCategoryId } from "@/data/types";
import { locationsWithheld, projectFunding } from "./disclosure";

// Current Needs filter state, kept in the URL. Same rules as the directory:
// options within a facet are OR'd, facets are AND'd, and "meets" requires every
// picked category. Projects are never ranked by urgency; by default they are
// grouped under the organization that runs them.

export const AVAILABILITY = ["open", "funded"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const PROJECT_SORTS = ["organization", "deadline", "remaining", "progress"] as const;
export type ProjectSort = (typeof PROJECT_SORTS)[number];

export type ProjectFacet = "region" | "sector" | "meets" | "availability";

export interface ProjectFilters {
  q: string;
  region: Oblast[];
  sector: Sector[];
  meets: VerificationCategoryId[];
  availability: Availability[];
  sort: ProjectSort;
}

export const EMPTY_PROJECT_FILTERS: ProjectFilters = {
  q: "",
  region: [],
  sector: [],
  meets: [],
  availability: [],
  sort: "organization",
};

const FACETS: { key: ProjectFacet; allowed: readonly string[] }[] = [
  { key: "region", allowed: OBLASTS },
  { key: "sector", allowed: SECTORS },
  { key: "meets", allowed: VERIFICATION_CATEGORIES },
  { key: "availability", allowed: AVAILABILITY },
];

type ParamReader = { get(name: string): string | null };

export function parseProjectFilters(params: ParamReader): ProjectFilters {
  const filters: ProjectFilters = { ...EMPTY_PROJECT_FILTERS, q: (params.get("q") ?? "").trim().slice(0, 100) };
  for (const { key, allowed } of FACETS) {
    const values = (params.get(key) ?? "").split(",").filter((v) => allowed.includes(v));
    (filters[key] as string[]) = [...new Set(values)];
  }
  const sort = params.get("sort");
  if ((PROJECT_SORTS as readonly string[]).includes(sort ?? "")) filters.sort = sort as ProjectSort;
  return filters;
}

export function serializeProjectFilters(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const { key } of FACETS) if (filters[key].length) params.set(key, filters[key].join(","));
  if (filters.sort !== "organization") params.set("sort", filters.sort);
  return params.toString();
}

/** A project joined with the organization that implements it. */
export interface NeedRow {
  project: Project;
  org: Organization;
}

function valueFor(row: NeedRow, facet: ProjectFacet): string {
  switch (facet) {
    case "region":
      // Withheld locations never match a region filter.
      return locationsWithheld(row.org) ? "" : (row.project.region ?? "");
    case "sector":
      return row.project.sector;
    case "meets":
      return "";
    case "availability":
      return row.project.status === "open" ? "open" : "funded";
  }
}

function matchesQuery({ project, org }: NeedRow, q: string): boolean {
  if (!q) return true;
  const haystack = [project.title, project.summary, org.name, org.nameUk].join(" ").toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

function matches(row: NeedRow, filters: ProjectFilters, skip?: ProjectFacet): boolean {
  if (!matchesQuery(row, filters.q)) return false;
  return FACETS.every(({ key }) => {
    const selected = filters[key] as string[];
    if (key === skip || selected.length === 0) return true;
    if (key === "meets") return meetsAll(row, filters.meets);
    return selected.includes(valueFor(row, key));
  });
}

function meetsAll(row: NeedRow, ids: VerificationCategoryId[]): boolean {
  return ids.every((id) => row.org.verification.categories[id] === "meets-standard");
}

// Withheld amounts sort by their band's midpoint, never by the exact figure.
const progress = (p: Project) => projectFunding(p).percent / 100;
const remaining = (p: Project) => p.targetUsd * (1 - progress(p));
// Fully funded projects always sort after open ones.
const openFirst = (a: NeedRow, b: NeedRow) => Number(a.project.status !== "open") - Number(b.project.status !== "open");

const comparators: Record<ProjectSort, (a: NeedRow, b: NeedRow) => number> = {
  organization: (a, b) =>
    a.org.name.localeCompare(b.org.name) || openFirst(a, b) || a.project.title.localeCompare(b.project.title),
  deadline: (a, b) => openFirst(a, b) || a.project.deadline.localeCompare(b.project.deadline),
  remaining: (a, b) => openFirst(a, b) || remaining(b.project) - remaining(a.project),
  progress: (a, b) => openFirst(a, b) || progress(a.project) - progress(b.project),
};

export function filterNeeds(rows: NeedRow[], filters: ProjectFilters): NeedRow[] {
  return rows.filter((row) => matches(row, filters)).sort(comparators[filters.sort]);
}

export function needFacetCount(rows: NeedRow[], filters: ProjectFilters, facet: ProjectFacet, value: string): number {
  if (facet === "meets") {
    return rows.filter((row) => matches(row, filters, facet) && meetsAll(row, [...filters.meets, value as VerificationCategoryId])).length;
  }
  return rows.filter((row) => matches(row, filters, facet) && valueFor(row, facet) === value).length;
}

export function activeNeedFilterCount(filters: ProjectFilters): number {
  return (filters.q ? 1 : 0) + FACETS.reduce((sum, { key }) => sum + filters[key].length, 0);
}
