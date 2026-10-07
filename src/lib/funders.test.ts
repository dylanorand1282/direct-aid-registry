import { describe, expect, it } from "vitest";
import { DEMO_FUNDER_SLUG, funders, MIN_FEEDBACK_RESPONSES } from "@/data/funders";
import { funderSchema } from "@/data/schema";
import { getFunder, grantBurden, publishedFeedback } from "./funders";

describe("funder records", () => {
  it("are valid, fictional and include the demo funder", () => {
    funders.forEach((f) => funderSchema.parse(f));
    expect(funders.every((f) => f.isFictional)).toBe(true);
    expect(getFunder(DEMO_FUNDER_SLUG)).toBeDefined();
    expect(new Set(funders.map((f) => f.slug)).size).toBe(funders.length);
  });

  it("never hold partners' own words", () => {
    for (const f of funders) expect(f.feedback).not.toHaveProperty("comments");
  });

  it("hide themes raised by too few partners, and show bands rather than counts", () => {
    const tidewater = publishedFeedback(getFunder("tidewater-relief-partnership")!);
    expect(tidewater.themes.map((t) => t.theme)).not.toContain("relationship"); // 1 of 9
    expect(tidewater.themes.find((t) => t.theme === "reporting-burden")?.band).toBe("most");
    expect(JSON.stringify(tidewater.themes)).not.toMatch(/mentions/);
  });

  it("publish partner feedback only above the response threshold", () => {
    for (const f of funders) {
      const fb = publishedFeedback(f);
      expect(fb.published).toBe(f.feedback.responses >= MIN_FEEDBACK_RESPONSES);
      if (!fb.published) {
        expect(fb.themes).toEqual([]);
        expect(fb.averageRating).toBeNull();
      }
      expect(Object.keys(fb)).not.toContain("comments");
    }
    expect(publishedFeedback(getFunder("pinecrest-diaspora-circle")!).published).toBe(false);
  });
});

describe("grant burden", () => {
  it("counts the core-cost shortfall and reporting time", () => {
    const b = grantBurden(getFunder("tidewater-relief-partnership")!, 50_000, {
      ownCorePercent: 20,
      staffHourUsd: 10,
      questionnaireHours: 40,
      bridgingPercentPerYear: 20,
      lateByDays: 30,
    });
    expect(b.coreShortfallUsd).toBe(6_500); // 13% of 50k
    expect(b.reportingHours).toBe(80 + 40); // half a year of reports plus its own questionnaire
    expect(b.reportingCostUsd).toBe(1_200);
    expect(b.daysUntilMoney).toBe(115);
    expect(b.waitingCostUsd).toBe(3_151); // 50k at 20% a year for 115 days
    expect(b.lateCostUsd).toBe(247); // 30% chance of a 30-day delay
    expect(b.unpaidUsd).toBe(7_500); // 15% of promised money never paid
    expect(b.usableUsd).toBe(50_000 - 18_598);
  });

  it("never shows a shortfall when the funder allows enough overhead", () => {
    expect(grantBurden(getFunder("larkspur-family-fund")!, 50_000).coreShortfallUsd).toBe(0);
  });

  it("counts no unpaid money or late cost for a funder that always pays in full and on time", () => {
    const b = grantBurden(getFunder("larkspur-family-fund")!, 50_000);
    expect(b.unpaidUsd).toBe(0);
    expect(b.lateCostUsd).toBe(0);
  });

  it("puts the worst funder's burden well above a third of the grant", () => {
    expect(grantBurden(getFunder("tidewater-relief-partnership")!, 50_000).burdenPercent).toBeGreaterThanOrEqual(35);
  });

  it("ranks a light funder as cheaper to take money from than a heavy one", () => {
    const light = grantBurden(getFunder("larkspur-family-fund")!, 50_000);
    const heavy = grantBurden(getFunder("tidewater-relief-partnership")!, 50_000);
    expect(light.burdenPercent).toBeLessThan(heavy.burdenPercent);
  });
});
