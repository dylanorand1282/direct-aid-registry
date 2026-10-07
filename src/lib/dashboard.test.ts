import { describe, expect, it } from "vitest";
import { RECORDS_AS_OF } from "@/data/verificationEvents";
import {
  combinePledges,
  followedOrgSlugs,
  pledgeTotals,
  SEEDED_PLEDGES,
  upcomingReports,
  updatesFeed,
  verificationFeed,
} from "./dashboard";
import type { StoredPledge } from "./storage";

const browserPledge: StoredPledge = {
  id: "SIM-TEST01",
  projectSlug: "sumy-protected-classroom-fitout",
  amountUsd: 1_000,
  designation: "whole-project",
  date: "2026-10-07",
  simulated: true,
};

describe("donor dashboard", () => {
  it("merges seeded and browser pledges, newest first, and ignores unknown projects", () => {
    const pledges = combinePledges([browserPledge, { ...browserPledge, id: "SIM-GONE", projectSlug: "no-such-project" }]);
    expect(pledges).toHaveLength(SEEDED_PLEDGES.length + 1);
    expect(pledges[0]).toMatchObject({ id: "SIM-TEST01", source: "browser" });
    expect(pledgeTotals(pledges).totalUsd).toBe(26_000);
    // Seeded: $7,500 of $25,000 unrestricted; the browser pledge is project-restricted.
    expect(pledgeTotals(pledges).unrestrictedShare).toBe(29);
  });

  it("follows organizations behind saved and pledged projects", () => {
    const orgs = followedOrgSlugs(combinePledges([]), { orgs: [], projects: ["sumy-protected-classroom-fitout"] });
    expect(orgs).toContain("open-classroom-foundation");
    expect(orgs).toContain("northbank-mobile-clinics");
  });

  it("lists owed reports soonest first and flags overdue ones against the record date", () => {
    const reports = upcomingReports(combinePledges([]), RECORDS_AS_OF);
    expect(reports.length).toBeGreaterThan(0);
    expect([...reports].sort((a, b) => a.due.localeCompare(b.due))).toEqual(reports);
    for (const r of reports) expect(r.overdue).toBe(r.due < RECORDS_AS_OF);
  });

  it("reports unrestricted support once a year per organization, not per project", () => {
    const reports = upcomingReports(combinePledges([]), RECORDS_AS_OF);
    const orgReports = reports.filter((r) => r.scope === "organization");
    expect(orgReports.map((r) => r.orgSlug).sort()).toEqual(["northbank-mobile-clinics", "riverline-water-sanitation"]);
    expect(reports.some((r) => r.projectSlug === "kharkiv-second-clinic-van")).toBe(false);
  });

  it("shows only updates and verification changes for followed records", () => {
    for (const u of updatesFeed(["kharkiv-second-clinic-van"])) expect(u.projectSlug).toBe("kharkiv-second-clinic-van");
    const events = verificationFeed(["open-classroom-foundation"]);
    expect(events.map((e) => e.orgSlug)).toEqual(events.map(() => "open-classroom-foundation"));
    expect(events[0]).toMatchObject({ kind: "category-change", to: "unable-to-verify" });
  });
});
