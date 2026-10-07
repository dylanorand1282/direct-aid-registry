import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import { decisionFacts, reportingSchedule } from "./projectEvidence";
import { getOrganization, getProject, getUpdatesForProject } from "./queries";

describe("project evidence", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-20", 14)).toBe("2027-01-03");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("schedules an update after each pending milestone and a final report", () => {
    const schedule = reportingSchedule(getProject("zaporizhzhia-winter-heating-kits")!);
    expect(schedule).toEqual([
      { label: "Update on “First 150 kits installed”", due: "2026-11-24" },
      { label: "Update on “All 400 households covered”", due: "2027-01-03" },
      { label: "Final report with outcomes and spending", due: "2027-02-18" },
    ]);
  });

  it("derives decision facts from the record", () => {
    const project = getProject("zaporizhzhia-winter-heating-kits")!;
    const facts = decisionFacts(project, getOrganization(project.orgSlug)!, getUpdatesForProject(project.slug));
    expect(facts.operatesInRegion).toBe(true);
    expect(facts.delaysReported).toBe(1);
    expect(facts.milestonesDone).toBe(1);
    expect(facts.largestLine.core).toBeUndefined();
    expect(facts.largestLineShare).toBe(40);
    expect(facts.coreShare).toBe(15);
  });
});
