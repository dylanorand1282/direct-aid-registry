import { describe, expect, it } from "vitest";
import {
  EVIDENCE_GRADES,
  MIN_COMPLETED_PROJECTS_FOR_TRACK_RECORD,
  STANDARD_DATE,
  STATUS_DEFINITIONS,
  VERIFICATION_CATEGORY_DEFINITIONS,
  VERIFICATION_IS_NOT,
} from "@/data/methodology";
import { organizations } from "@/data/organizations";
import { VERIFICATION_CATEGORIES } from "@/data/schema";
import { categoriesForNextTier, findingsSummary, nextReviewDue, nextTier, requiredFor, statusBreakdown, tierForFindings } from "./verification";

const org = (slug: string) => organizations.find((o) => o.slug === slug)!;

describe("verification rules", () => {
  it("defines every category exactly once, in schema order", () => {
    expect(VERIFICATION_CATEGORY_DEFINITIONS.map((c) => c.id)).toEqual([...VERIFICATION_CATEGORIES]);
  });

  it("matches each organization's tier to its category statuses", () => {
    for (const o of organizations) {
      const meets = VERIFICATION_CATEGORIES.filter((id) => o.verification.categories[id] === "meets-standard");
      expect(meets, o.slug).toEqual(expect.arrayContaining(requiredFor(o, o.verification.tier)));
      expect(tierForFindings(o.verification.categories, o.annualBudgetUsd < 150_000 ? "light" : o.annualBudgetUsd > 1_000_000 ? "full" : "standard"), o.slug).toBe(o.verification.tier);
    }
  });

  it("has a reviewer note for every category that does not meet the standard", () => {
    for (const o of organizations) {
      for (const id of VERIFICATION_CATEGORIES) {
        const note = o.verification.notes[id];
        if (o.verification.categories[id] === "meets-standard") expect(note, `${o.slug}/${id}`).toBeUndefined();
        else expect(note, `${o.slug}/${id}`).toBeTruthy();
      }
    }
  });

  it("only leaves organizations at Applied unreviewed", () => {
    for (const o of organizations) {
      expect(o.verification.lastReviewed === null, o.slug).toBe(o.verification.tier === "applied");
    }
  });

  it("lists what stands between an organization and the next tier", () => {
    expect(categoriesForNextTier(org("steppe-shelter-alliance"))).toEqual(["safeguarding", "reporting-track-record"]);
    expect(categoriesForNextTier(org("eastern-corridor-evacuation"))).toEqual([
      "financial-controls",
      "operational-capacity",
    ]);
    expect(categoriesForNextTier(org("northbank-mobile-clinics"))).toEqual([]);
    expect(nextTier("tier-3")).toBeNull();
  });

  it("lets a light-track organization reach every tier without unreviewed categories", () => {
    const lightAllMet = {
      "legal-registration": "meets-standard",
      governance: "meets-standard",
      "financial-controls": "meets-standard",
      "operational-capacity": "not-assessed",
      safeguarding: "meets-standard",
      "reporting-track-record": "not-assessed",
    } as const;
    expect(tierForFindings(lightAllMet, "light")).toBe("tier-3");
    expect(tierForFindings({ ...lightAllMet, safeguarding: "partially-meets" }, "light")).toBe("tier-2");
    expect(tierForFindings(lightAllMet, "standard")).toBe("tier-1");
  });

  it("summarizes findings without the overall tier", () => {
    expect(findingsSummary(org("northbank-mobile-clinics"))).toBe("6 of 6 categories meet the standard");
    expect(findingsSummary(org("open-classroom-foundation"))).toMatch(/unable to verify/);
    expect(findingsSummary(org("open-classroom-foundation"))).not.toMatch(/tier/i);
  });

  it("schedules the next review one cycle after the last", () => {
    expect(nextReviewDue("2026-08-14")).toBe("2027-08-14");
    expect(nextReviewDue(null)).toBeNull();
  });
});

describe("fixtures follow the standard's own criteria", () => {
  it("only marks reporting track record as met with enough completed projects", () => {
    for (const o of organizations) {
      if (o.verification.categories["reporting-track-record"] === "meets-standard") {
        expect(o.pastProjectSlugs.length, o.slug).toBeGreaterThanOrEqual(MIN_COMPLETED_PROJECTS_FOR_TRACK_RECORD);
      }
    }
  });

  it("keeps every review date inside the current cycle", () => {
    for (const o of organizations) {
      const due = nextReviewDue(o.verification.lastReviewed);
      if (due) expect(due > STANDARD_DATE, o.slug).toBe(true);
    }
  });
});

describe("methodology content", () => {
  it("defines criteria, evidence, method and limits for every category", () => {
    for (const c of VERIFICATION_CATEGORY_DEFINITIONS) {
      expect(c.criteria.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.evidence.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.redFlags.length, c.id).toBeGreaterThanOrEqual(1);
      expect(c.method && c.limit, c.id).toBeTruthy();
    }
  });

  it("never lets self-declaration support Meets standard", () => {
    expect(EVIDENCE_GRADES.find((g) => g.grade === "D")?.canSupportMeets).toBe(false);
  });

  it("counts only Meets standard toward a tier", () => {
    const counting = Object.entries(STATUS_DEFINITIONS).filter(([, d]) => d.countsTowardTier).map(([s]) => s);
    expect(counting).toEqual(["meets-standard"]);
  });

  it("states the four limits donors most need to know", () => {
    const titles = VERIFICATION_IS_NOT.map((n) => n.title.toLowerCase());
    for (const word of ["endorsement", "fraud", "audit", "outcomes"]) {
      expect(titles.some((t) => t.includes(word)), word).toBe(true);
    }
  });
});

describe("unable to verify stays distinct from not meeting the standard", () => {
  it("has its own status, definition and label", () => {
    expect(STATUS_DEFINITIONS["unable-to-verify"].meaning).toMatch(/not a finding against the organization/);
    expect(STATUS_DEFINITIONS["does-not-meet"].meaning).toMatch(/finding about the organization/);
  });

  it("reports it separately in the breakdown", () => {
    const org = organizations.find((o) => o.slug === "open-classroom-foundation")!;
    const breakdown = statusBreakdown(org);
    expect(breakdown.find((b) => b.status === "unable-to-verify")?.count).toBe(1);
    expect(breakdown.find((b) => b.status === "does-not-meet")).toBeUndefined();
    expect(breakdown.reduce((sum, b) => sum + b.count, 0)).toBe(6);
  });
});
