import type {
  CategoryStatus,
  FundingNeed,
  Oblast,
  ProjectStatus,
  Sector,
  Urgency,
  VerificationCategoryId,
  VerificationTier,
} from "@/data/types";

export const oblastLabel: Record<Oblast, string> = {
  kyiv: "Kyiv",
  kharkiv: "Kharkiv",
  dnipropetrovsk: "Dnipropetrovsk",
  zaporizhzhia: "Zaporizhzhia",
  mykolaiv: "Mykolaiv",
  kherson: "Kherson",
  odesa: "Odesa",
  donetsk: "Donetsk",
  sumy: "Sumy",
  chernihiv: "Chernihiv",
  lviv: "Lviv",
  poltava: "Poltava",
};

export const sectorLabel: Record<Sector, string> = {
  health: "Health",
  shelter: "Shelter",
  "food-security": "Food security",
  wash: "Water and sanitation",
  protection: "Protection",
  "mental-health": "Mental health",
  education: "Education",
  livelihoods: "Livelihoods",
  evacuation: "Evacuation",
  winterization: "Winterization",
};

export const fundingNeedLabel: Record<FundingNeed, string> = {
  urgent: "Urgent",
  high: "High",
  moderate: "Moderate",
  covered: "Covered",
};

export const tierName: Record<VerificationTier, string> = {
  applied: "Applied",
  "tier-1": "Tier 1",
  "tier-2": "Tier 2",
  "tier-3": "Tier 3",
};

// Every standalone tier label is prefixed so no screen can read as a real verification.
export const tierLabel: Record<VerificationTier, string> = {
  applied: `Illustrative: ${tierName.applied}`,
  "tier-1": `Illustrative: ${tierName["tier-1"]}`,
  "tier-2": `Illustrative: ${tierName["tier-2"]}`,
  "tier-3": `Illustrative: ${tierName["tier-3"]}`,
};

export const categoryLabel: Record<VerificationCategoryId, string> = {
  "legal-registration": "Legal registration",
  governance: "Governance",
  "financial-controls": "Financial controls",
  "operational-capacity": "Operational capacity",
  safeguarding: "Safeguarding",
  "reporting-track-record": "Reporting track record",
};

export const categoryShortLabel: Record<VerificationCategoryId, string> = {
  "legal-registration": "Legal",
  governance: "Governance",
  "financial-controls": "Finances",
  "operational-capacity": "Operations",
  safeguarding: "Safeguarding",
  "reporting-track-record": "Reporting",
};

export const categoryStatusLabel: Record<CategoryStatus, string> = {
  "not-assessed": "Not assessed",
  "unable-to-verify": "Unable to verify",
  "does-not-meet": "Does not meet standard",
  "in-review": "In review",
  "partially-meets": "Partially meets",
  "meets-standard": "Meets standard",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  open: "Open",
  funded: "Fully funded",
  "in-progress": "In progress",
  completed: "Completed",
};

export const urgencyLabel: Record<Urgency, string> = {
  critical: "Critical",
  high: "High",
  standard: "Standard",
};
