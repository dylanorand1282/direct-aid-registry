import { describe, expect, it } from "vitest";
import {
  EMPTY_PROJECT_FILTERS,
  filterNeeds,
  needFacetCount,
  parseProjectFilters,
  serializeProjectFilters,
  type ProjectFilters,
} from "./projectFilters";
import { getCurrentNeeds } from "./queries";

const rows = getCurrentNeeds();
const withFilters = (patch: Partial<ProjectFilters>): ProjectFilters => ({ ...EMPTY_PROJECT_FILTERS, ...patch });
const slugs = (f: ProjectFilters) => filterNeeds(rows, f).map((r) => r.project.slug);

describe("Current Needs filters", () => {
  it("lists open and fully funded projects, never completed ones", () => {
    expect(rows.length).toBe(10);
    expect(rows.some((r) => r.project.status === "completed")).toBe(false);
  });

  it("round-trips through the URL and drops unknown values", () => {
    const f = withFilters({ q: "van", region: ["kharkiv"], meets: ["safeguarding"], availability: ["open"], sort: "deadline" });
    expect(parseProjectFilters(new URLSearchParams(serializeProjectFilters(f)))).toEqual(f);
    expect(parseProjectFilters(new URLSearchParams("urgency=extreme&sort=x"))).toEqual(EMPTY_PROJECT_FILTERS);
  });

  it("groups projects by organization by default and never ranks by urgency", () => {
    const all = filterNeeds(rows, EMPTY_PROJECT_FILTERS);
    const orgNames = all.map((r) => r.org.name);
    expect(orgNames).toEqual([...orgNames].sort((a, b) => a.localeCompare(b)));
    expect(parseProjectFilters(new URLSearchParams("sort=urgency")).sort).toBe("organization");
  });

  it("filters by the categories in which the implementing organization meets the standard", () => {
    expect(slugs(withFilters({ meets: ["reporting-track-record"] })).sort()).toEqual([
      "kharkiv-second-clinic-van",
      "kyiv-teen-group-counselling",
    ]);
  });

  it("never matches a project by a withheld location", () => {
    expect(slugs(withFilters({ region: ["donetsk"] }))).not.toContain("corridor-accessible-evacuation-vehicle");
  });

  it("can hide fully funded projects", () => {
    expect(slugs(withFilters({ availability: ["open"] }))).not.toContain("dnipro-collective-centre-repairs");
  });

  it("counts options against the other active filters", () => {
    const f = withFilters({ sector: ["health"] });
    expect(needFacetCount(rows, f, "sector", "shelter")).toBeGreaterThan(0);
    expect(needFacetCount(rows, f, "meets", "reporting-track-record")).toBe(1);
  });
});
