import type { Funder } from "./types";

// FICTIONAL PLACEHOLDER DATA. Funder records let Ukrainian organizations judge
// a funder before accepting its money. In a real registry, timing and payment
// figures would come from records the receiving organizations confirm, and
// feedback would be collected anonymously by the Integrity Officer.

/** Partner feedback is published only above this many responses, to protect partners from retaliation. */
export const MIN_FEEDBACK_RESPONSES = 5;

export const DEMO_FUNDER_SLUG = "demo-foundation";

export const funders: Funder[] = [
  {
    slug: "demo-foundation",
    isFictional: true,
    name: "Demo Foundation",
    type: "foundation",
    country: "United States",
    recordSince: "2025-03-01",
    grantsLast12Months: 9,
    metrics: {
      medianDecisionDays: 21,
      medianPaymentDays: 9,
      unrestrictedSharePercent: 29,
      overheadAllowedPercent: 15,
      paidOnTimePercent: 92,
      paidInFullPercent: 100,
      typicalGrantMonths: 12,
      reportsPerYear: 2,
      reportingHoursPerYear: 30,
    },
    reportingRequirements: ["Milestone updates as published on the registry", "Final report with spending by budget line"],
    acceptsRegistryRecord: true,
    feedback: {
      responses: 7,
      averageRating: 4.1,
      themes: [
        { theme: "decision-speed", direction: "praise", mentions: 5 },
        { theme: "duplicate-due-diligence", direction: "praise", mentions: 4 },
        { theme: "overhead", direction: "concern", mentions: 4 },
      ],
    },
  },
  {
    slug: "larkspur-family-fund",
    isFictional: true,
    name: "Larkspur Family Fund",
    type: "foundation",
    country: "United States",
    recordSince: "2024-11-15",
    grantsLast12Months: 14,
    metrics: {
      medianDecisionDays: 14,
      medianPaymentDays: 5,
      unrestrictedSharePercent: 80,
      overheadAllowedPercent: 25,
      paidOnTimePercent: 100,
      paidInFullPercent: 100,
      typicalGrantMonths: 24,
      reportsPerYear: 1,
      reportingHoursPerYear: 12,
    },
    reportingRequirements: ["Annual report and accounts, as already prepared for the registry"],
    acceptsRegistryRecord: true,
    feedback: {
      responses: 6,
      averageRating: 4.6,
      themes: [
        { theme: "flexibility", direction: "praise", mentions: 5 },
        { theme: "reporting-burden", direction: "praise", mentions: 4 },
        { theme: "language", direction: "praise", mentions: 3 },
      ],
    },
  },
  {
    slug: "tidewater-relief-partnership",
    isFictional: true,
    name: "Tidewater Relief Partnership",
    type: "corporate",
    country: "United Kingdom",
    recordSince: "2025-01-20",
    grantsLast12Months: 11,
    metrics: {
      medianDecisionDays: 75,
      medianPaymentDays: 40,
      unrestrictedSharePercent: 0,
      overheadAllowedPercent: 7,
      paidOnTimePercent: 70,
      paidInFullPercent: 85,
      typicalGrantMonths: 6,
      reportsPerYear: 12,
      reportingHoursPerYear: 160,
    },
    reportingRequirements: [
      "Monthly narrative and financial report on the funder's own English-language template",
      "Photo evidence of every distribution",
      "Its own due-diligence questionnaire, in addition to the registry record",
    ],
    acceptsRegistryRecord: false,
    feedback: {
      responses: 9,
      averageRating: 2.8,
      themes: [
        { theme: "reporting-burden", direction: "concern", mentions: 8 },
        { theme: "payment-timing", direction: "concern", mentions: 5 },
        { theme: "language", direction: "concern", mentions: 4 },
        { theme: "relationship", direction: "praise", mentions: 1 },
      ],
    },
  },
  {
    slug: "halyard-health-access-trust",
    isFictional: true,
    name: "Halyard Health Access Trust",
    type: "foundation",
    country: "Switzerland",
    recordSince: "2025-06-02",
    grantsLast12Months: 5,
    metrics: {
      medianDecisionDays: 120,
      medianPaymentDays: 30,
      unrestrictedSharePercent: 10,
      overheadAllowedPercent: 10,
      paidOnTimePercent: 88,
      paidInFullPercent: 100,
      typicalGrantMonths: 24,
      reportsPerYear: 4,
      reportingHoursPerYear: 64,
    },
    reportingRequirements: ["Quarterly reports against a logframe", "Annual external audit of the grant"],
    acceptsRegistryRecord: true,
    feedback: {
      responses: 5,
      averageRating: 3.4,
      themes: [
        { theme: "decision-speed", direction: "concern", mentions: 4 },
        { theme: "payment-timing", direction: "praise", mentions: 3 },
      ],
    },
  },
  {
    slug: "pinecrest-diaspora-circle",
    isFictional: true,
    name: "Pinecrest Diaspora Circle",
    type: "diaspora-group",
    country: "Canada",
    recordSince: "2026-02-10",
    grantsLast12Months: 4,
    metrics: {
      medianDecisionDays: 7,
      medianPaymentDays: 3,
      unrestrictedSharePercent: 60,
      overheadAllowedPercent: 20,
      paidOnTimePercent: 95,
      paidInFullPercent: 100,
      typicalGrantMonths: 3,
      reportsPerYear: 2,
      reportingHoursPerYear: 10,
    },
    reportingRequirements: ["Short update with photos at the end of each grant"],
    acceptsRegistryRecord: true,
    feedback: { responses: 3, averageRating: null, themes: [] },
  },
];

export const FEEDBACK_THEME_LABEL: Record<Funder["feedback"]["themes"][number]["theme"], string> = {
  "decision-speed": "Speed of decisions",
  "payment-timing": "Payment timing",
  "reporting-burden": "Reporting burden",
  overhead: "Overhead allowed",
  flexibility: "Flexibility of funding",
  language: "Language of reporting",
  "duplicate-due-diligence": "Repeat due diligence",
  relationship: "Working relationship",
};

export const FUNDER_TYPE_LABEL: Record<Funder["type"], string> = {
  foundation: "Foundation",
  individual: "Individual donor",
  corporate: "Corporate donor",
  "diaspora-group": "Diaspora giving group",
  "public-donor": "Public donor",
};

/** What each figure means and where a real registry would get it. */
export const FUNDER_METRIC_DEFINITIONS = [
  { label: "Decision time", definition: "Median days from a complete request to a yes or no.", source: "Dates confirmed by the receiving organization." },
  { label: "Payment time", definition: "Median days from signed agreement to money in the organization's account.", source: "Bank receipt dates confirmed by the receiving organization." },
  { label: "Unrestricted share", definition: "Share of the funder's grant money given without restriction to a project or budget line.", source: "Grant agreements, confirmed by both sides." },
  { label: "Overhead allowed", definition: "The highest core-cost share the funder accepts in a restricted budget.", source: "The funder's own policy, checked against agreements." },
  { label: "Paid on time", definition: "Share of promised payments that arrived on or before the agreed date.", source: "Payment schedules and receipts confirmed by the receiving organization." },
  { label: "Paid in full", definition: "Share of promised money that was actually paid.", source: "Payment schedules and receipts confirmed by the receiving organization." },
  { label: "Reporting time", definition: "Median staff hours per year the funder's reporting takes, as estimated by partners.", source: "Anonymous partner survey run by the Integrity Officer." },
] as const;

export const FUNDER_RECORD_NOTES = {
  why: "Due diligence runs both ways. An organization should be able to judge whether a funder's money is worth the time, delay and restrictions that come with it before it says yes.",
  fictional: "Every funder on this page is fictional, and so are its figures and feedback.",
  safety: `Feedback is published only once at least ${MIN_FEEDBACK_RESPONSES} organizations have responded, and only as a rating and common themes. Partners' own words are never published, because what someone writes can identify them. A theme raised by fewer than a quarter of partners is not shown. Feedback is collected and held by the Integrity Officer, not by the funder or the platform operator.`,
  rightOfReply: "Funders can add a public response to their record but cannot remove partner feedback or change confirmed figures.",
} as const;
