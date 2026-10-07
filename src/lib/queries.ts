import { demoDonor } from "@/data/donor";
import { impactMetrics } from "@/data/impact";
import { organizations } from "@/data/organizations";
import { projects } from "@/data/projects";
import { projectUpdates } from "@/data/updates";
import { RECORDS_AS_OF } from "@/data/verificationEvents";
import type { ImpactMetric, Organization, Project, ProjectUpdate } from "@/data/types";

// Pages read data through these functions only, never the raw arrays.

export function getOrganizations(): Organization[] {
  return organizations;
}

export function getOrganization(slug: string): Organization | undefined {
  return organizations.find((org) => org.slug === slug);
}

export function getProjects(): Project[] {
  return projects;
}

export function getOpenProjects(): Project[] {
  return projects.filter((project) => project.status === "open");
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectsForOrg(orgSlug: string): Project[] {
  return projects.filter((project) => project.orgSlug === orgSlug);
}

export function getUpdatesForProject(projectSlug: string): ProjectUpdate[] {
  return projectUpdates
    .filter((update) => update.projectSlug === projectSlug)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getImpactForProject(projectSlug: string): ImpactMetric[] {
  return impactMetrics.filter((metric) => metric.projectSlug === projectSlug);
}

export function getDemoDonor() {
  return demoDonor;
}

/**
 * Organizations shown on the home page, in a rotation that moves on each day
 * instead of a ranking, so no organization is permanently on top and none
 * is featured for looking the most urgent.
 */
export function getFeaturedOrganizations(limit = 3, asOf: string = RECORDS_AS_OF): Organization[] {
  const sorted = [...organizations].sort((a, b) => a.name.localeCompare(b.name));
  const start = dayNumber(asOf) % sorted.length;
  return [...sorted.slice(start), ...sorted.slice(0, start)].slice(0, limit);
}

/** One open project from each featured organization, so projects follow organizations. */
export function getFeaturedProjects(limit = 3, asOf: string = RECORDS_AS_OF): Project[] {
  return getFeaturedOrganizations(organizations.length, asOf)
    .map((org) => getProjectsForOrg(org.slug).find((p) => p.status === "open"))
    .filter((p): p is Project => p !== undefined)
    .slice(0, limit);
}

function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

export function getRegistrySummary() {
  const open = getOpenProjects();
  return {
    organizationCount: organizations.length,
    openProjectCount: open.length,
    // Projects whose organization withholds its amounts are left out of the total.
    openFundingGapUsd: open.reduce((sum, p) => sum + (p.raisedUsd === null ? 0 : p.targetUsd - p.raisedUsd), 0),
    oblastCount: new Set(organizations.flatMap((o) => o.operatingRegions)).size,
  };
}

/** Stable fictional record reference, e.g. "FIC-003". The prefix marks it as placeholder data. */
export function getOrgRecordId(slug: string): string {
  const index = organizations.findIndex((org) => org.slug === slug);
  return `FIC-${String(index + 1).padStart(3, "0")}`;
}

/** Projects shown on Current Needs (open or fully funded, not completed), with their organization. */
export function getCurrentNeeds(): { project: Project; org: Organization }[] {
  return projects
    .filter((project) => project.status === "open" || project.status === "funded" || project.status === "in-progress")
    .map((project) => ({ project, org: getOrganization(project.orgSlug)! }));
}
