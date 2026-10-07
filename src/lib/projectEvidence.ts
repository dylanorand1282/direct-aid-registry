import { FINAL_REPORT_WITHIN_DAYS, UPDATE_WITHIN_DAYS_OF_MILESTONE } from "@/data/methodology";
import type { Organization, Project, ProjectUpdate } from "@/data/types";
import { addDays } from "./dates";
import { getProject } from "./queries";

export interface ReportingExpectation {
  label: string;
  due: string;
}

/** Dated reports a funder could expect from now on, derived from the project's milestones. */
export function reportingSchedule(project: Project): ReportingExpectation[] {
  const pending = project.milestones.filter((m) => !m.done);
  const lastDue = project.milestones.map((m) => m.due).sort().at(-1) ?? project.deadline;
  return [
    ...pending.map((m) => ({ label: `Update on “${m.label}”`, due: addDays(m.due, UPDATE_WITHIN_DAYS_OF_MILESTONE) })),
    { label: "Final report with outcomes and spending", due: addDays(lastDue, FINAL_REPORT_WITHIN_DAYS) },
  ];
}

/** Facts a funder would check before deciding, all derived from the record. */
export function decisionFacts(project: Project, org: Organization, updates: ProjectUpdate[]) {
  const similarCompleted = org.pastProjectSlugs
    .map(getProject)
    .filter((p): p is Project => p !== undefined && p.sector === project.sector);
  const largestLine = [...project.budget].filter((l) => !l.core).sort((a, b) => b.amountUsd - a.amountUsd)[0];
  const coreUsd = coreCostsUsd(project);
  return {
    operatesInRegion: project.region !== null && org.operatingRegions.includes(project.region),
    similarCompletedCount: similarCompleted.length,
    milestonesDone: project.milestones.filter((m) => m.done).length,
    milestonesTotal: project.milestones.length,
    delaysReported: updates.filter((u) => u.kind === "delay").length,
    largestLine,
    largestLineShare: Math.round((largestLine.amountUsd / project.targetUsd) * 100),
    coreUsd,
    coreShare: Math.round((coreUsd / project.targetUsd) * 100),
  };
}

export function coreCostsUsd(project: Project): number {
  return project.budget.filter((l) => l.core).reduce((sum, l) => sum + l.amountUsd, 0);
}
