import { demoDonor } from "@/data/donor";
import { restrictionOf } from "@/data/fundingTerms";
import type { ProjectUpdate, VerificationEvent } from "@/data/types";
import { verificationEvents } from "@/data/verificationEvents";
import { reportingSchedule } from "./projectEvidence";
import { addDays } from "./dates";
import { getOrganization, getProject, getUpdatesForProject } from "./queries";
import type { SavedRecords } from "./saved";
import type { StoredPledge } from "./storage";
import { nextReviewDue } from "./verification";

export interface DashboardPledge {
  id: string;
  projectSlug: string;
  amountUsd: number;
  designation: string;
  date: string;
  /** "seeded" pledges belong to the demo persona; "browser" ones were made in the simulator. */
  source: "seeded" | "browser";
}

export const SEEDED_PLEDGES: DashboardPledge[] = demoDonor.pledges.map((p, i) => ({
  id: `SIM-DEMO${i + 1}`,
  projectSlug: p.projectSlug,
  amountUsd: p.amountUsd,
  designation: p.designation,
  date: p.date,
  source: "seeded",
}));

/** Seeded and browser pledges together, newest first. */
export function combinePledges(stored: StoredPledge[]): DashboardPledge[] {
  const browser = stored
    .filter((p) => getProject(p.projectSlug))
    .map((p): DashboardPledge => ({ ...p, source: "browser" }));
  return [...SEEDED_PLEDGES, ...browser].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function pledgeTotals(pledges: DashboardPledge[]) {
  const projects = new Set(pledges.map((p) => p.projectSlug));
  const orgs = new Set([...projects].map((slug) => getProject(slug)!.orgSlug));
  const totalUsd = pledges.reduce((sum, p) => sum + p.amountUsd, 0);
  const unrestrictedUsd = pledges.filter((p) => restrictionOf(p.designation) === "unrestricted").reduce((sum, p) => sum + p.amountUsd, 0);
  return {
    count: pledges.length,
    totalUsd,
    unrestrictedShare: totalUsd === 0 ? 0 : Math.round((unrestrictedUsd / totalUsd) * 100),
    projects: projects.size,
    orgs: orgs.size,
  };
}

/** Projects the donor pledged to or saved, in that order, without repeats. */
export function followedProjectSlugs(pledges: DashboardPledge[], saved: SavedRecords): string[] {
  return [...new Set([...pledges.map((p) => p.projectSlug), ...saved.projects])].filter((slug) => getProject(slug));
}

/** Saved organizations plus the organizations behind every followed project. */
export function followedOrgSlugs(pledges: DashboardPledge[], saved: SavedRecords): string[] {
  const fromProjects = followedProjectSlugs(pledges, saved).map((slug) => getProject(slug)!.orgSlug);
  return [...new Set([...saved.orgs, ...fromProjects])];
}

export interface UpcomingReport {
  /** Project reports come from restricted pledges; organization reports from unrestricted ones. */
  scope: "project" | "organization";
  projectSlug: string | null;
  orgSlug: string;
  label: string;
  due: string;
  overdue: boolean;
}

/**
 * Reports the donor is owed, soonest first. Restricted pledges are reported
 * per project (completed projects owe none); unrestricted support is reported
 * once a year through the organization's annual report and accounts.
 */
export function upcomingReports(pledges: DashboardPledge[], asOf: string): UpcomingReport[] {
  const restricted = new Set(pledges.filter((p) => restrictionOf(p.designation) !== "unrestricted").map((p) => p.projectSlug));
  const projectReports = [...restricted]
    .map((slug) => getProject(slug)!)
    .filter((project) => project.status !== "completed")
    .flatMap((project) =>
      reportingSchedule(project).map((r) => ({ scope: "project" as const, projectSlug: project.slug, orgSlug: project.orgSlug, label: r.label, due: r.due })),
    );
  const unrestrictedOrgs = new Set(
    pledges.filter((p) => restrictionOf(p.designation) === "unrestricted").map((p) => getProject(p.projectSlug)!.orgSlug),
  );
  const orgReports = [...unrestrictedOrgs].map((orgSlug) => ({
    scope: "organization" as const,
    projectSlug: null,
    orgSlug,
    label: "Annual report and accounts",
    due: nextReviewDue(getOrganization(orgSlug)!.verification.lastReviewed) ?? addDays(asOf, 365),
  }));
  return [...projectReports, ...orgReports]
    .map((r) => ({ ...r, overdue: r.due < asOf }))
    .sort((a, b) => a.due.localeCompare(b.due));
}

export function updatesFeed(projectSlugs: string[], limit = 8): ProjectUpdate[] {
  return projectSlugs
    .flatMap(getUpdatesForProject)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function verificationFeed(orgSlugs: string[]): VerificationEvent[] {
  const followed = new Set(orgSlugs);
  return verificationEvents.filter((e) => followed.has(e.orgSlug)).sort((a, b) => b.date.localeCompare(a.date));
}
