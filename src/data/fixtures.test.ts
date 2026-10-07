import { describe, expect, it } from "vitest";
import { demoDonor } from "./donor";
import { impactMetrics } from "./impact";
import { organizations } from "./organizations";
import { projects } from "./projects";
import {
  donorProfileSchema,
  impactMetricSchema,
  organizationSchema,
  projectSchema,
  projectUpdateSchema,
  verificationEventSchema,
} from "./schema";
import { REVIEW_TRACKS, trackForBudget } from "./methodology";
import { projectUpdates } from "./updates";
import { RECORDS_AS_OF, verificationEvents } from "./verificationEvents";

const orgSlugs = new Set(organizations.map((o) => o.slug));
const projectSlugs = new Set(projects.map((p) => p.slug));

describe("fixture data", () => {
  it("validates against the schema", () => {
    organizations.forEach((o) => organizationSchema.parse(o));
    projects.forEach((p) => projectSchema.parse(p));
    projectUpdates.forEach((u) => projectUpdateSchema.parse(u));
    impactMetrics.forEach((m) => impactMetricSchema.parse(m));
    donorProfileSchema.parse(demoDonor);
  });

  it("has unique slugs and ids", () => {
    expect(orgSlugs.size).toBe(organizations.length);
    expect(projectSlugs.size).toBe(projects.length);
    expect(new Set(projectUpdates.map((u) => u.id)).size).toBe(projectUpdates.length);
  });

  it("links every reference to an existing record", () => {
    for (const p of projects) expect(orgSlugs, p.slug).toContain(p.orgSlug);
    for (const o of organizations) {
      for (const slug of [...o.pastProjectSlugs, ...o.currentProjectSlugs]) {
        expect(projectSlugs, `${o.slug} -> ${slug}`).toContain(slug);
        expect(projects.find((p) => p.slug === slug)?.orgSlug).toBe(o.slug);
      }
    }
    for (const u of projectUpdates) expect(projectSlugs, u.id).toContain(u.projectSlug);
    for (const m of impactMetrics) expect(projectSlugs, m.label).toContain(m.projectSlug);
    for (const s of demoDonor.savedOrgSlugs) expect(orgSlugs).toContain(s);
    for (const p of demoDonor.pledges) expect(projectSlugs).toContain(p.projectSlug);
  });

  it("lists every project under exactly one organization, past or current by status", () => {
    for (const p of projects) {
      const org = organizations.find((o) => o.slug === p.orgSlug)!;
      const list = p.status === "completed" ? org.pastProjectSlugs : org.currentProjectSlugs;
      expect(list, p.slug).toContain(p.slug);
    }
  });

  it("keeps budgets and funding figures consistent", () => {
    for (const p of projects) {
      const budgetTotal = p.budget.reduce((sum, line) => sum + line.amountUsd, 0);
      expect(budgetTotal, p.slug).toBe(p.targetUsd);
      const org = organizations.find((o) => o.slug === p.orgSlug)!;
      if (p.raisedUsd === null) {
        // Only an open project of an organization that withholds its gap may hide its amounts.
        expect(org.disclosure?.fundingGap, p.slug).toBe("withheld");
        expect(p.status, p.slug).toBe("open");
        expect(p.fundedBand, p.slug).toBeDefined();
        continue;
      }
      expect(p.fundedBand, p.slug).toBeUndefined();
      expect(p.raisedUsd, p.slug).toBeLessThanOrEqual(p.targetUsd);
      if (p.status !== "open") expect(p.raisedUsd, p.slug).toBe(p.targetUsd);
    }
    for (const o of organizations) {
      if (o.disclosure?.fundingGap === "withheld") {
        expect(o.fundingGapUsd, o.slug).toBeNull();
        continue;
      }
      const gap = o.currentProjectSlugs
        .map((slug) => projects.find((p) => p.slug === slug)!)
        .reduce((sum, p) => sum + (p.targetUsd - (p.raisedUsd ?? 0)), 0);
      expect(o.fundingGapUsd, o.slug).toBe(gap);
    }
  });

  it("only gives outcomes to completed projects", () => {
    for (const p of projects) {
      if (p.status === "completed") expect(p.outcomes?.length, p.slug).toBeGreaterThan(0);
      else expect(p.outcomes, p.slug).toBeUndefined();
    }
  });

  it("keeps verification history consistent with each current record", () => {
    verificationEvents.forEach((e) => verificationEventSchema.parse(e));
    expect(new Set(verificationEvents.map((e) => e.id)).size).toBe(verificationEvents.length);
    const byDate = [...verificationEvents].sort((a, b) => a.date.localeCompare(b.date));
    for (const org of organizations) {
      const events = byDate.filter((e) => e.orgSlug === org.slug);
      for (const e of events) expect(e.date <= RECORDS_AS_OF, e.id).toBe(true);
      for (const category of Object.keys(org.verification.categories)) {
        const last = events.filter((e) => e.kind === "category-change" && e.category === category).at(-1);
        if (last?.kind === "category-change") expect(last.to, last.id).toBe(org.verification.categories[category as keyof typeof org.verification.categories]);
      }
      const lastTier = events.filter((e) => e.kind !== "category-change").at(-1);
      if (lastTier?.kind === "tier-change") expect(lastTier.toTier, lastTier.id).toBe(org.verification.tier);
      if (lastTier?.kind === "review-completed") expect(lastTier.tier, lastTier.id).toBe(org.verification.tier);
    }
    for (const e of verificationEvents) expect(orgSlugs).toContain(e.orgSlug);
  });

  it("only saves records that exist", () => {
    for (const slug of demoDonor.savedOrgSlugs) expect(orgSlugs).toContain(slug);
    for (const slug of demoDonor.savedProjectSlugs) expect(projectSlugs).toContain(slug);
  });

  it("gives every budget one line for the organization's core costs", () => {
    for (const p of projects) {
      const core = p.budget.filter((l) => l.core);
      expect(core, p.slug).toHaveLength(1);
      const share = core[0].amountUsd / p.targetUsd;
      expect(share, p.slug).toBeGreaterThanOrEqual(0.1);
      expect(share, p.slug).toBeLessThanOrEqual(0.25);
    }
  });

  it("never reviews a category outside an organization's track", () => {
    for (const o of organizations) {
      const track = REVIEW_TRACKS[trackForBudget(o.annualBudgetUsd)];
      for (const [category, status] of Object.entries(o.verification.categories)) {
        if (!track.categories.includes(category as never)) expect(status, `${o.slug} ${category}`).toBe("not-assessed");
      }
    }
  });
});
