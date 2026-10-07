import { describe, expect, it } from "vitest";
import { organizations } from "@/data/organizations";
import { projects } from "@/data/projects";
import { projectUpdates } from "@/data/updates";
import { OBLASTS } from "@/data/schema";
import { oblastLabel } from "./labels";
import { bandFor, projectFunding, publicGap, publicHeadquarters, publicRegions, WITHHELD_GAP, WITHHELD_LOCATION } from "./disclosure";

const withheld = organizations.filter((o) => o.disclosure?.locations === "withheld");

describe("withheld disclosures", () => {
  it("include at least one frontline example", () => {
    expect(withheld.length).toBeGreaterThan(0);
  });

  it("keep withheld locations out of the public record entirely", () => {
    for (const org of withheld) {
      expect(org.headquarters).toBeNull();
      expect(org.operatingRegions).toEqual([]);
      expect(org.programs.every((p) => p.regions.length === 0)).toBe(true);
      expect(projects.filter((p) => p.orgSlug === org.slug).every((p) => p.region === null)).toBe(true);
    }
  });

  it("require locations from every organization that publishes them", () => {
    for (const org of organizations.filter((o) => o.disclosure?.locations !== "withheld")) {
      expect(org.headquarters, org.slug).not.toBeNull();
      expect(org.operatingRegions.length, org.slug).toBeGreaterThan(0);
      expect(projects.filter((p) => p.orgSlug === org.slug).every((p) => p.region !== null), org.slug).toBe(true);
    }
  });

  it("never show a withheld location or gap", () => {
    for (const org of withheld) {
      expect(publicRegions(org)).toBe(WITHHELD_LOCATION);
      expect(publicHeadquarters(org)).toBe(WITHHELD_LOCATION);
    }
    for (const org of organizations.filter((o) => o.disclosure?.fundingGap === "withheld")) {
      expect(publicGap(org)).toBe(WITHHELD_GAP);
    }
  });

  it("leave no oblast in the public text, slugs or updates of an organization that withholds them", () => {
    const names = OBLASTS.flatMap((o) => [oblastLabel[o].toLowerCase(), o]);
    for (const org of withheld) {
      const own = projects.filter((p) => p.orgSlug === org.slug);
      const text = [
        org.slug,
        org.name,
        org.summary,
        org.mission,
        ...org.programs.flatMap((p) => [p.name, p.description]),
        ...own.flatMap((p) => [p.slug, p.title, p.summary, ...p.budget.map((b) => b.line), ...p.milestones.map((m) => m.label)]),
        ...projectUpdates.filter((u) => own.some((p) => p.slug === u.projectSlug)).flatMap((u) => [u.title, u.body]),
      ]
        .join(" ")
        .toLowerCase();
      for (const name of names) expect(text, `${org.slug} mentions ${name}`).not.toContain(name);
    }
  });

  it("hide exact project amounts when the funding gap is withheld, so the gap cannot be worked out", () => {
    const gapHidden = organizations.filter((o) => o.disclosure?.fundingGap === "withheld");
    expect(gapHidden.length).toBeGreaterThan(0);
    for (const org of gapHidden) {
      expect(org.fundingGapUsd).toBeNull();
      const open = projects.filter((p) => p.orgSlug === org.slug && p.status === "open");
      for (const project of open) {
        expect(project.raisedUsd, project.slug).toBeNull();
        const funding = projectFunding(project);
        expect(funding.exact).toBe(false);
        // The public band leaves at least a quarter of the budget uncertain.
        expect(funding.maxStillNeededUsd).toBeGreaterThanOrEqual(project.targetUsd * 0.25);
      }
      // Updates on its open projects carry no dollar figures either.
      const text = projectUpdates.filter((u) => open.some((p) => p.slug === u.projectSlug)).map((u) => `${u.title} ${u.body}`).join(" ");
      expect(text).not.toMatch(/\$\s?\d|\d,\d{3}|USD/);
    }
  });

  it("show exact amounts for organizations that publish their gap", () => {
    for (const project of projects.filter((p) => !organizations.find((o) => o.slug === p.orgSlug)?.disclosure?.fundingGap)) {
      expect(projectFunding(project).exact, project.slug).toBe(true);
    }
    expect(bandFor(10_000, 54_000)).toBe("under-quarter");
    expect(bandFor(27_000, 54_000)).toBe("half-three-quarters");
  });
});
