import { DEMO_FUNDER_SLUG, funders, MIN_FEEDBACK_RESPONSES } from "@/data/funders";
import type { Funder } from "@/data/types";

export function getFunders(): Funder[] {
  return funders;
}

export function getFunder(slug: string): Funder | undefined {
  return funders.find((f) => f.slug === slug);
}

export function getDemoFunder(): Funder {
  return getFunder(DEMO_FUNDER_SLUG)!;
}

/** Below this share of responses a theme is not shown, since a rare complaint can point to one partner. */
export const MIN_THEME_SHARE = 0.25;

export type ThemeBand = "most" | "several";

/**
 * Feedback as it may be published: nothing below the response threshold, and
 * above it only a rating and themes in bands, never counts a funder could
 * match to individual partners.
 */
export function publishedFeedback(funder: Funder) {
  const { responses } = funder.feedback;
  const published = responses >= MIN_FEEDBACK_RESPONSES;
  const themes = published
    ? funder.feedback.themes
        .filter((t) => t.mentions >= 2 && t.mentions / responses >= MIN_THEME_SHARE)
        .map((t) => ({ theme: t.theme, direction: t.direction, band: (t.mentions / responses >= 0.5 ? "most" : "several") as ThemeBand }))
    : [];
  return { published, responses, averageRating: published ? funder.feedback.averageRating : null, themes };
}

export type BurdenAssumptions = {
  /** What the organization's core costs really are, as a share of a project budget. */
  ownCorePercent: number;
  /** Fully loaded cost of one staff hour spent on reporting. */
  staffHourUsd: number;
  /** Extra hours when the funder sends its own questionnaire instead of accepting the registry record. */
  questionnaireHours: number;
  /** Yearly cost of covering costs while waiting for money: credit, supplier terms, or reserves used. */
  bridgingPercentPerYear: number;
  /** How late a late payment typically is. */
  lateByDays: number;
};

export const DEFAULT_ASSUMPTIONS: BurdenAssumptions = {
  ownCorePercent: 20,
  staffHourUsd: 10,
  questionnaireHours: 40,
  bridgingPercentPerYear: 20,
  lateByDays: 30,
};

/**
 * "Is this donor's grant worth the administrative burden?" A rough, transparent
 * estimate from the funder's own record and the organization's own assumptions.
 */
export function grantBurden(funder: Funder, grantUsd: number, a: BurdenAssumptions = DEFAULT_ASSUMPTIONS) {
  const m = funder.metrics;
  const years = m.typicalGrantMonths / 12;
  const coreShortfallUsd = Math.round((grantUsd * Math.max(0, a.ownCorePercent - m.overheadAllowedPercent)) / 100);
  const reportingHours = Math.round(m.reportingHoursPerYear * years) + (funder.acceptsRegistryRecord ? 0 : a.questionnaireHours);
  const reportingCostUsd = Math.round(reportingHours * a.staffHourUsd);
  const daysUntilMoney = m.medianDecisionDays + m.medianPaymentDays;
  const rate = a.bridgingPercentPerYear / 100;
  // Covering the work while the decision and first payment are pending.
  const waitingCostUsd = Math.round((grantUsd * rate * daysUntilMoney) / 365);
  // Expected cost of late payments: the chance a payment is late times the cost of covering the delay.
  const lateCostUsd = Math.round((grantUsd * ((100 - m.paidOnTimePercent) / 100) * rate * a.lateByDays) / 365);
  // Expected share of the promised grant that never arrives, from the funder's own record.
  const unpaidUsd = Math.round((grantUsd * (100 - m.paidInFullPercent)) / 100);
  const burdenUsd = coreShortfallUsd + reportingCostUsd + waitingCostUsd + lateCostUsd + unpaidUsd;
  return {
    grantUsd,
    coreShortfallUsd,
    reportingHours,
    reportingCostUsd,
    waitingCostUsd,
    lateCostUsd,
    unpaidUsd,
    burdenUsd,
    burdenPercent: grantUsd > 0 ? Math.round((burdenUsd / grantUsd) * 100) : 0,
    usableUsd: Math.max(0, grantUsd - burdenUsd),
    daysUntilMoney,
    latePaymentPercent: 100 - m.paidOnTimePercent,
    monthsOfSupport: m.typicalGrantMonths,
  };
}

export type GrantBurden = ReturnType<typeof grantBurden>;
