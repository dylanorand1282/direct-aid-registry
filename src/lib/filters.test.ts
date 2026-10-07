import { describe, expect, it } from "vitest";
import { organizations } from "@/data/organizations";
import {
  EMPTY_ORG_FILTERS,
  activeFilterCount,
  facetCount,
  filterOrganizations,
  parseOrgFilters,
  serializeOrgFilters,
  type OrgFilters,
} from "./filters";

const params = (qs: string) => new URLSearchParams(qs);
const withFilters = (patch: Partial<OrgFilters>): OrgFilters => ({ ...EMPTY_ORG_FILTERS, ...patch });
const slugs = (filters: OrgFilters) => filterOrganizations(organizations, filters).map((o) => o.slug);

describe("parseOrgFilters", () => {
  it("returns defaults for an empty query", () => {
    expect(parseOrgFilters(params(""))).toEqual(EMPTY_ORG_FILTERS);
  });

  it("drops unknown values and duplicates", () => {
    const f = parseOrgFilters(params("region=kharkiv,atlantis,kharkiv&meets=verified&sort=need&view=table"));
    expect(f.region).toEqual(["kharkiv"]);
    expect(f.meets).toEqual([]);
    expect(f.sort).toBe("name");
    expect(f.view).toBe("grid");
  });

  it("round-trips through the URL", () => {
    const f = withFilters({ q: "clinic", region: ["kharkiv", "sumy"], need: ["urgent"], meets: ["safeguarding"], sort: "reviewed", view: "list" });
    expect(parseOrgFilters(params(serializeOrgFilters(f)))).toEqual(f);
  });

  it("writes nothing for the default state", () => {
    expect(serializeOrgFilters(EMPTY_ORG_FILTERS)).toBe("");
  });
});

describe("filterOrganizations", () => {
  it("shows every organization with no filters", () => {
    expect(slugs(EMPTY_ORG_FILTERS)).toHaveLength(organizations.length);
  });

  it("ORs options within a facet", () => {
    const result = slugs(withFilters({ sector: ["health", "education"] }));
    expect(result.sort()).toEqual(["northbank-mobile-clinics", "open-classroom-foundation"]);
  });

  it("ANDs across facets", () => {
    expect(slugs(withFilters({ region: ["kharkiv"], sector: ["health"] }))).toEqual(["northbank-mobile-clinics"]);
  });

  it("requires every picked category to meet the standard", () => {
    const one = slugs(withFilters({ meets: ["legal-registration"] }));
    const two = slugs(withFilters({ meets: ["legal-registration", "safeguarding"] }));
    expect(two.length).toBeLessThan(one.length);
    for (const slug of two) {
      const o = organizations.find((x) => x.slug === slug)!;
      expect(o.verification.categories.safeguarding).toBe("meets-standard");
    }
  });

  it("never matches an organization's withheld locations", () => {
    const withheld = organizations.find((o) => o.disclosure?.locations === "withheld")!;
    expect(withheld.operatingRegions).toEqual([]);
    for (const region of ["donetsk", "dnipropetrovsk", "kharkiv"] as const) {
      expect(slugs(withFilters({ region: [region] }))).not.toContain(withheld.slug);
      expect(facetCount(organizations, EMPTY_ORG_FILTERS, "region", region)).toBe(
        organizations.filter((o) => o.disclosure?.locations !== "withheld" && o.operatingRegions.includes(region)).length,
      );
    }
  });

  it("matches regions an organization operates in, not just its headquarters", () => {
    expect(slugs(withFilters({ region: ["sumy"] })).sort()).toEqual([
      "northbank-mobile-clinics",
      "open-classroom-foundation",
    ]);
  });

  it("searches names in English and Ukrainian, and program names", () => {
    expect(slugs(withFilters({ q: "water" }))).toEqual(["riverline-water-sanitation"]);
    expect(slugs(withFilters({ q: "Комора" }))).toEqual(["granary-food-security"]);
    expect(slugs(withFilters({ q: "microgrants" }))).toEqual(["hearth-livelihoods-cooperative"]);
  });

  it("lists by name by default, never ranked by need, gap or tier", () => {
    const names = filterOrganizations(organizations, EMPTY_ORG_FILTERS).map((o) => o.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    expect(slugs(withFilters({ sort: "reviewed" })).at(-1)).toBe("hearth-livelihoods-cooperative");
  });
});

describe("facetCount", () => {
  it("ignores the facet's own selection so other options stay selectable", () => {
    const f = withFilters({ sector: ["health"] });
    expect(facetCount(organizations, f, "sector", "education")).toBe(1);
    expect(facetCount(organizations, f, "region", "kharkiv")).toBe(1);
    expect(facetCount(organizations, f, "region", "odesa")).toBe(0);
  });

  it("counts active filters for the mobile toggle", () => {
    expect(activeFilterCount(withFilters({ q: "x", region: ["kyiv", "sumy"], meets: ["governance"] }))).toBe(4);
  });
});
