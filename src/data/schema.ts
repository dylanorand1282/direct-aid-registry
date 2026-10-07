import { z } from "zod";

// Every record in this prototype is fictional. `isFictional: z.literal(true)`
// makes a record without the flag fail both type-checking and validation.
const fictional = z.literal(true);

export const OBLASTS = [
  "kyiv",
  "kharkiv",
  "dnipropetrovsk",
  "zaporizhzhia",
  "mykolaiv",
  "kherson",
  "odesa",
  "donetsk",
  "sumy",
  "chernihiv",
  "lviv",
  "poltava",
] as const;

export const SECTORS = [
  "health",
  "shelter",
  "food-security",
  "wash",
  "protection",
  "mental-health",
  "education",
  "livelihoods",
  "evacuation",
  "winterization",
] as const;

export const FUNDING_NEEDS = ["urgent", "high", "moderate", "covered"] as const;

// Illustrative only: never rendered without the word "Illustrative".
export const VERIFICATION_TIERS = ["applied", "tier-1", "tier-2", "tier-3"] as const;

export const VERIFICATION_CATEGORIES = [
  "legal-registration",
  "governance",
  "financial-controls",
  "operational-capacity",
  "safeguarding",
  "reporting-track-record",
] as const;

// "unable-to-verify" means a check could not be done (often for security
// reasons); "does-not-meet" means evidence showed a criterion was not met.
// They must never be presented as the same thing.
export const CATEGORY_STATUSES = [
  "not-assessed",
  "unable-to-verify",
  "does-not-meet",
  "in-review",
  "partially-meets",
  "meets-standard",
] as const;

export const PROJECT_STATUSES = ["open", "funded", "in-progress", "completed"] as const;
export const URGENCIES = ["critical", "high", "standard"] as const;
export const FEEDBACK_THEMES = [
  "decision-speed",
  "payment-timing",
  "reporting-burden",
  "overhead",
  "flexibility",
  "language",
  "duplicate-due-diligence",
  "relationship",
] as const;

// How far an open project is funded, in quarters of its budget. Used instead of
// exact figures when the organization withholds its funding gap.
export const FUNDED_BANDS = ["under-quarter", "quarter-half", "half-three-quarters", "over-three-quarters"] as const;

export const UPDATE_KINDS = ["milestone", "financial", "field-report", "delay"] as const;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case slug");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date (YYYY-MM-DD)");
const usd = z.number().int().nonnegative();

export const oblastSchema = z.enum(OBLASTS);
export const sectorSchema = z.enum(SECTORS);
export const verificationCategorySchema = z.enum(VERIFICATION_CATEGORIES);
export const categoryStatusSchema = z.enum(CATEGORY_STATUSES);
export const verificationTierSchema = z.enum(VERIFICATION_TIERS);

export const programSchema = z.object({
  id: slug,
  name: z.string().min(1),
  sector: sectorSchema,
  description: z.string().min(1),
  // Empty when the organization withholds its locations.
  regions: z.array(oblastSchema),
  beneficiariesPerYear: z.number().int().positive(),
});

export const organizationSchema = z.object({
  slug,
  name: z.string().min(1),
  nameUk: z.string().min(1),
  isFictional: fictional,
  founded: z.number().int().min(1991).max(2026),
  // Null and empty when the organization withholds its locations: withheld
  // values are held privately by reviewers and never enter the public record.
  headquarters: oblastSchema.nullable(),
  operatingRegions: z.array(oblastSchema),
  sectors: z.array(sectorSchema).min(1),
  mission: z.string().min(1),
  summary: z.string().min(1).max(140),
  staffCount: z.number().int().nonnegative(),
  volunteerCount: z.number().int().nonnegative(),
  annualBudgetUsd: usd,
  fundingNeed: z.enum(FUNDING_NEEDS),
  // Null when the organization withholds its funding gap.
  fundingGapUsd: usd.nullable(),
  // What the organization chose to publish. Oblast level is the most precise
  // location ever published; frontline groups can withhold even that.
  disclosure: z
    .object({ locations: z.enum(["oblast", "withheld"]), fundingGap: z.enum(["published", "withheld"]) })
    .optional(),
  verification: z.object({
    tier: verificationTierSchema,
    lastReviewed: isoDate.nullable(),
    categories: z.record(verificationCategorySchema, categoryStatusSchema),
    // Reviewer's note for every category that does not yet meet the standard.
    notes: z.partialRecord(verificationCategorySchema, z.string().min(1)),
  }),
  programs: z.array(programSchema).min(1),
  pastProjectSlugs: z.array(slug),
  currentProjectSlugs: z.array(slug),
});

export const projectSchema = z.object({
  slug,
  orgSlug: slug,
  isFictional: fictional,
  title: z.string().min(1),
  sector: sectorSchema,
  region: oblastSchema.nullable(),
  status: z.enum(PROJECT_STATUSES),
  urgency: z.enum(URGENCIES),
  summary: z.string().min(1).max(200),
  targetUsd: usd,
  // Null, with a funded band instead, when the organization withholds its funding
  // gap: exact amounts raised would reveal the gap, so they stay with reviewers.
  raisedUsd: usd.nullable(),
  fundedBand: z.enum(FUNDED_BANDS).optional(),
  deadline: isoDate,
  beneficiaries: z.number().int().positive(),
  // `core` marks the line for the organization's own running costs (overhead).
  budget: z.array(z.object({ line: z.string().min(1), amountUsd: usd, core: z.literal(true).optional() })).min(1),
  milestones: z.array(z.object({ label: z.string().min(1), due: isoDate, done: z.boolean() })),
  outcomes: z.array(z.string().min(1)).optional(),
});

export const projectUpdateSchema = z.object({
  id: slug,
  projectSlug: slug,
  isFictional: fictional,
  date: isoDate,
  title: z.string().min(1),
  body: z.string().min(1),
  kind: z.enum(UPDATE_KINDS),
});

export const impactMetricSchema = z.object({
  projectSlug: slug,
  isFictional: fictional,
  label: z.string().min(1),
  value: z.number().nonnegative(),
  unit: z.string().min(1),
  period: z.string().min(1),
});

export const donorProfileSchema = z.object({
  id: z.literal("demo-donor"),
  isFictional: fictional,
  displayName: z.string().min(1),
  type: z.enum(["foundation", "individual", "corporate", "diaspora-group"]),
  focusSectors: z.array(sectorSchema),
  focusRegions: z.array(oblastSchema),
  savedOrgSlugs: z.array(slug),
  savedProjectSlugs: z.array(slug),
  pledges: z.array(
    z.object({
      projectSlug: slug,
      amountUsd: usd.positive(),
      // "unrestricted", "whole-project" or a budget line name.
      designation: z.string().min(1),
      date: isoDate,
      simulated: z.literal(true),
    }),
  ),
});


// A dated change to an organization's verification record.
const verificationEventBase = { id: slug, orgSlug: slug, isFictional: fictional, date: isoDate, summary: z.string().min(1) };

export const verificationEventSchema = z.discriminatedUnion("kind", [
  z.object({ ...verificationEventBase, kind: z.literal("category-change"), category: verificationCategorySchema, from: categoryStatusSchema, to: categoryStatusSchema }),
  z.object({ ...verificationEventBase, kind: z.literal("tier-change"), fromTier: verificationTierSchema, toTier: verificationTierSchema }),
  z.object({ ...verificationEventBase, kind: z.literal("review-completed"), tier: verificationTierSchema }),
]);

// Two-sided due diligence: what Ukrainian organizations can see about a funder.
export const funderSchema = z.object({
  slug,
  isFictional: fictional,
  name: z.string().min(1),
  type: z.enum(["foundation", "individual", "corporate", "diaspora-group", "public-donor"]),
  country: z.string().min(1),
  recordSince: isoDate,
  grantsLast12Months: z.number().int().nonnegative(),
  metrics: z.object({
    medianDecisionDays: z.number().int().nonnegative(),
    medianPaymentDays: z.number().int().nonnegative(),
    unrestrictedSharePercent: z.number().min(0).max(100),
    overheadAllowedPercent: z.number().min(0).max(100),
    paidOnTimePercent: z.number().min(0).max(100),
    paidInFullPercent: z.number().min(0).max(100),
    typicalGrantMonths: z.number().int().positive(),
    reportsPerYear: z.number().int().nonnegative(),
    reportingHoursPerYear: z.number().int().nonnegative(),
  }),
  reportingRequirements: z.array(z.string().min(1)),
  acceptsRegistryRecord: z.boolean(),
  feedback: z.object({
    responses: z.number().int().nonnegative(),
    averageRating: z.number().min(1).max(5).nullable(),
    // Partners' own words are never stored or published: content can identify who wrote it.
    themes: z.array(
      z.object({
        theme: z.enum(FEEDBACK_THEMES),
        direction: z.enum(["praise", "concern"]),
        mentions: z.number().int().positive(),
      }),
    ),
  }),
});
