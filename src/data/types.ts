import type { z } from "zod";
import type {
  CATEGORY_STATUSES,
  FUNDING_NEEDS,
  OBLASTS,
  PROJECT_STATUSES,
  SECTORS,
  UPDATE_KINDS,
  URGENCIES,
  VERIFICATION_CATEGORIES,
  VERIFICATION_TIERS,
  donorProfileSchema,
  impactMetricSchema,
  organizationSchema,
  programSchema,
  projectSchema,
  projectUpdateSchema,
  verificationEventSchema,
  funderSchema,
} from "./schema";

export type Oblast = (typeof OBLASTS)[number];
export type Sector = (typeof SECTORS)[number];
export type FundingNeed = (typeof FUNDING_NEEDS)[number];
export type VerificationTier = (typeof VERIFICATION_TIERS)[number];
export type VerificationCategoryId = (typeof VERIFICATION_CATEGORIES)[number];
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type Urgency = (typeof URGENCIES)[number];
export type UpdateKind = (typeof UPDATE_KINDS)[number];

export type Program = z.infer<typeof programSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ImpactMetric = z.infer<typeof impactMetricSchema>;
export type DonorProfile = z.infer<typeof donorProfileSchema>;
export type VerificationEvent = z.infer<typeof verificationEventSchema>;
export type Funder = z.infer<typeof funderSchema>;
