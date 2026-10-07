import { describe, expect, it } from "vitest";
import { getFeaturedOrganizations, getFeaturedProjects, getOrganizations, getRegistrySummary } from "./queries";

describe("home page queries", () => {
  it("features organizations in a daily rotation, not a ranking", () => {
    const today = getFeaturedOrganizations(3, "2026-10-07").map((o) => o.slug);
    const tomorrow = getFeaturedOrganizations(3, "2026-10-08").map((o) => o.slug);
    expect(today).toHaveLength(3);
    expect(tomorrow[0]).toBe(today[1]);
    // Every organization gets a turn at the top over a full cycle.
    const leaders = new Set(Array.from({ length: getOrganizations().length }, (_, i) => getFeaturedOrganizations(1, `2026-10-${String(i + 1).padStart(2, "0")}`)[0].slug));
    expect(leaders.size).toBe(getOrganizations().length);
  });

  it("features one open project from each featured organization", () => {
    const featured = getFeaturedProjects();
    expect(featured).toHaveLength(3);
    expect(featured.every((p) => p.status === "open")).toBe(true);
    expect(new Set(featured.map((p) => p.orgSlug)).size).toBe(3);
  });

  it("summarises the open funding gap from project figures", () => {
    const summary = getRegistrySummary();
    expect(summary.openProjectCount).toBe(9);
    // The only non-open current project is fully funded, so the totals agree.
    const orgGapTotal = getOrganizations().reduce((sum, o) => sum + (o.fundingGapUsd ?? 0), 0);
    expect(summary.openFundingGapUsd).toBe(orgGapTotal);
  });
});
