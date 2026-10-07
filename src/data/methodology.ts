import type { CategoryStatus, VerificationCategoryId, VerificationTier } from "./types";

// The proposed verification standard. It is a prototype draft: it has not
// been adopted, and no organization has been assessed under it. Profile pages
// and the methodology page both read from here so they always agree.

export const STANDARD_VERSION = "0.1 (draft for discussion)";
export const STANDARD_DATE = "2026-10-07";

export const REVIEW_CYCLE_MONTHS = 12;
export const GRACE_PERIOD_DAYS = 60;
export const MATERIAL_CHANGE_NOTICE_DAYS = 30;
export const TRIGGERED_REVIEW_DAYS = 30;
export const RIGHT_OF_REPLY_DAYS = 14;
export const APPEAL_WINDOW_DAYS = 30;
export const ALTERNATIVE_EVIDENCE_MAX_MONTHS = 6;
export const MIN_COMPLETED_PROJECTS_FOR_TRACK_RECORD = 2;

export interface VerificationCategory {
  id: VerificationCategoryId;
  name: string;
  question: string;
  /** All must be satisfied for "Meets standard". */
  criteria: string[];
  evidence: string[];
  method: string;
  redFlags: string[];
  /** The narrowest correct reading of a "Meets standard" in this category. */
  limit: string;
}

export const VERIFICATION_CATEGORY_DEFINITIONS: VerificationCategory[] = [
  {
    id: "legal-registration",
    name: "Legal registration",
    question: "Is the organization legally registered and in good standing in Ukraine?",
    criteria: [
      "Registered as a non-profit legal entity, with a registration extract no more than 3 months old at review",
      "Registered name, code and address match the details on the application",
      "Non-profit status is current, and no liquidation or termination proceedings are recorded",
      "The people who sign on its behalf are its registered authorised signatories",
    ],
    evidence: [
      "Extract from the Unified State Register of legal entities",
      "Non-profit status record",
      "Founding charter",
    ],
    method: "Checked directly against the public register by the reviewer, not only from a copy supplied by the organization.",
    redFlags: [
      "Details differ between the register and the application",
      "Signatories or leadership changed shortly before applying, with no explanation",
    ],
    limit: "Confirms the organization legally exists and is in good standing. It says nothing about how well it is run.",
  },
  {
    id: "governance",
    name: "Governance",
    question: "Does it have accountable leadership and documented decision-making?",
    criteria: [
      "A board or supervisory body of at least three people that is separate from day-to-day management",
      "A conflict-of-interest policy, with declarations from the board and senior staff",
      "Major decisions, including approval of the annual budget, are recorded in minutes",
      "No single person both authorises and makes payments",
    ],
    evidence: [
      "Board or supervisory body composition",
      "Conflict-of-interest policy and declarations",
      "Minutes of the last annual meeting",
    ],
    method: "Document review, followed by an interview with a board member who is not part of management.",
    redFlags: [
      "Board members are related to each other or to the director, with no declared mitigation",
      "There is no record of decisions being made",
    ],
    limit: "Confirms that accountable structures exist on paper and in interview. It cannot confirm they work as described every day.",
  },
  {
    id: "financial-controls",
    name: "Financial controls",
    question: "Are funds managed, separated and accounted for properly?",
    criteria: [
      "Financial statements for the most recent full financial year; an external audit for annual budgets over $250,000",
      "Funds are held in a bank account in the organization's own name",
      "A written procurement policy with competitive quotes above a stated threshold",
      "A reconciliation of a sample of transactions, chosen by the reviewer, to receipts and bank records",
    ],
    evidence: [
      "Annual financial statements or audit",
      "Bank account held in the organization's name",
      "Procurement policy",
    ],
    method: "Document review and a sample-based reconciliation. Bank account ownership is confirmed with a bank-issued document.",
    redFlags: [
      "Funds are held in a personal account",
      "Large unexplained differences between reported spending and bank records",
      "Unresolved audit findings from a previous year",
    ],
    limit: "Confirms basic controls existed and a sample reconciled. It is not an audit and cannot rule out fraud outside the sample.",
  },
  {
    id: "operational-capacity",
    name: "Operational capacity",
    question: "Can it deliver the work it proposes, where it proposes to do it?",
    criteria: [
      "Staff, volunteers and equipment are proportionate to the projects it lists",
      "Presence in the oblasts it lists is confirmed by a visit or live remote verification",
      "Delivery records exist for recent work of a similar type and scale",
      "Security and access risks in its operating areas are documented",
    ],
    evidence: [
      "Staffing and volunteer structure",
      "Site visit or remote verification",
      "Delivery records from recent work",
    ],
    method: "A site visit where security allows. Otherwise, live remote verification, recorded as such on the profile.",
    redFlags: [
      "Proposed projects are far larger than anything delivered before",
      "Presence in a listed oblast cannot be confirmed",
    ],
    limit: "Confirms capacity at the time of review. It does not predict whether a particular project will succeed.",
  },
  {
    id: "safeguarding",
    name: "Safeguarding",
    question: "Does it protect the people it serves, its staff and its volunteers from harm and exploitation?",
    criteria: [
      "A safeguarding and PSEA policy that covers staff, volunteers and partners",
      "A named safeguarding focal point, and a complaints channel that people receiving aid can reach",
      "Safeguarding training for staff and volunteers in contact with the people it serves, within the last 12 months",
      "Recruitment checks for roles with access to children or other at-risk adults",
    ],
    evidence: [
      "Safeguarding and PSEA policy",
      "Complaints and feedback mechanism",
      "Staff and volunteer training records",
    ],
    method: "Policy review, an interview with the focal point, and a test of whether the complaints channel actually works.",
    redFlags: [
      "No complaints channel that people receiving aid can use",
      "The policy excludes volunteers who work directly with them",
    ],
    limit: "Confirms that policies and channels exist and work. It cannot guarantee that no harm will occur.",
  },
  {
    id: "reporting-track-record",
    name: "Reporting track record",
    question: "Does it report results accurately and on time?",
    criteria: [
      `At least ${MIN_COMPLETED_PROJECTS_FOR_TRACK_RECORD} completed projects with final reports`,
      "Reported outcomes reconcile with distribution, attendance or service records for a sample chosen by the reviewer",
      "Reports were submitted within 60 days of the agreed date, and delays were disclosed",
      "Shortfalls and delays are reported, not left out",
    ],
    evidence: [
      "Reports from completed projects",
      "Reconciliation of reported outcomes with records",
      "Timeliness of past reports",
    ],
    method: "A sample-based check of reported figures against primary records. Where possible, beneficiaries are contacted to confirm they received help.",
    redFlags: [
      "Reported figures cannot be traced to any record",
      "Several donors received identical outcome figures for different projects",
    ],
    limit: "Confirms past reporting was accurate in the sample checked. It does not certify impact, and past results do not guarantee future ones.",
  },
];

export interface EvidenceGrade {
  grade: "A" | "B" | "C" | "D";
  name: string;
  description: string;
  examples: string;
  canSupportMeets: boolean;
}

export const EVIDENCE_GRADES: EvidenceGrade[] = [
  {
    grade: "A",
    name: "Independent source",
    description: "Obtained by the reviewer directly from a party other than the organization.",
    examples: "Public state register, bank-issued confirmation, report from a registered auditor",
    canSupportMeets: true,
  },
  {
    grade: "B",
    name: "Direct observation",
    description: "Seen or tested by the reviewer, or by a field partner acting for them.",
    examples: "Site visit, live remote walkthrough, test of a complaints channel",
    canSupportMeets: true,
  },
  {
    grade: "C",
    name: "Corroborated document",
    description: "Supplied by the organization and matched against at least one A or B source.",
    examples: "Board minutes matched to the register, receipts matched to bank records",
    canSupportMeets: true,
  },
  {
    grade: "D",
    name: "Self-declaration",
    description: "Supplied or stated by the organization with no independent check.",
    examples: "Uncorroborated policy documents, self-reported figures, answers on the application form",
    canSupportMeets: false,
  },
];

export const STATUS_DEFINITIONS: Record<CategoryStatus, { meaning: string; countsTowardTier: boolean }> = {
  "meets-standard": {
    meaning:
      "Every criterion was satisfied at the last review, each one supported by grade A, B or C evidence, with no unresolved red flags.",
    countsTowardTier: true,
  },
  "partially-meets": {
    meaning:
      "Some criteria were satisfied. The gaps are listed in the reviewer note, and the organization has a dated plan to close them.",
    countsTowardTier: false,
  },
  "in-review": {
    meaning: "Evidence has been submitted and is being assessed, or a red flag is being looked into.",
    countsTowardTier: false,
  },
  "does-not-meet": {
    meaning:
      "Evidence was reviewed and showed that one or more criteria are not satisfied, with no dated plan to close the gap. This is a finding about the organization.",
    countsTowardTier: false,
  },
  "unable-to-verify": {
    meaning:
      "The criteria could not be checked with acceptable evidence, for example because records were destroyed, a registry is unavailable or a visit would be unsafe. This is not a finding against the organization, and it is never shown or counted as a failure.",
    countsTowardTier: false,
  },
  "not-assessed": {
    meaning: "The category has not been reviewed yet, or the organization has not submitted evidence for it.",
    countsTowardTier: false,
  },
};

export const TIER_REQUIREMENTS: Record<VerificationTier, VerificationCategoryId[]> = {
  applied: [],
  "tier-1": ["legal-registration", "governance"],
  "tier-2": ["legal-registration", "governance", "financial-controls", "operational-capacity"],
  "tier-3": [
    "legal-registration",
    "governance",
    "financial-controls",
    "operational-capacity",
    "safeguarding",
    "reporting-track-record",
  ],
};

export const TIER_SUMMARY: Record<VerificationTier, string> = {
  applied: "Application received; assessment has not yet confirmed any category.",
  "tier-1": "Legal standing and governance confirmed.",
  "tier-2": "Tier 1, plus financial controls and operational capacity confirmed.",
  "tier-3": "All six categories confirmed, including safeguarding and reporting track record.",
};

export const TIER_MEANING: Record<VerificationTier, { tellsYou: string; doesNotTellYou: string }> = {
  applied: {
    tellsYou: "The organization has asked to be listed and has agreed to the standard's terms.",
    doesNotTellYou: "That any check has been passed. Its existence and legal standing are not yet confirmed.",
  },
  "tier-1": {
    tellsYou: "It is a legally registered non-profit in good standing, with accountable leadership and recorded decisions.",
    doesNotTellYou: "Whether its money is managed well, whether it can deliver at scale, or how it protects the people it serves.",
  },
  "tier-2": {
    tellsYou:
      "In addition, its basic financial controls were confirmed on a sample, and its capacity to deliver in the oblasts it lists was confirmed.",
    doesNotTellYou: "Whether its safeguarding is adequate, or whether its past results were reported accurately.",
  },
  "tier-3": {
    tellsYou:
      "All six categories met the standard at the last review, including safeguarding and a checked record of accurate reporting.",
    doesNotTellYou:
      "That it has been audited, that it carries no risk, or that it is more effective than an organization at a lower tier.",
  },
};

/** What a verification status is not. Shown first on the methodology page. */
export const VERIFICATION_IS_NOT = [
  {
    title: "Not an endorsement, or a decision about who deserves funding",
    body: "A status is not a recommendation to fund an organization, and not a judgement that it is better or more deserving than others. It is evidence that organizations and funders use to make their own decisions. Many sound organizations will sit at lower tiers for reasons unrelated to quality, such as being newly founded.",
  },
  {
    title: "Not a guarantee against fraud",
    body: "Review reduces some risks. It cannot eliminate them. Forged documents, collusion and misconduct after a review can all go undetected. Controls are checked on samples, never on every transaction.",
  },
  {
    title: "Not an audit",
    body: "Reviewers check that financial controls exist and reconcile a sample of transactions. That is far narrower than an audit by a registered auditor, which this process neither replaces nor provides.",
  },
  {
    title: "Not a guarantee of outcomes",
    body: "A status describes the organization at the time of review. It does not guarantee that any project will be delivered as planned, on time, or with the results described.",
  },
  {
    title: "Not permanent",
    body: `Each status describes the organization on the date of its last review. Statuses expire if they are not renewed within ${REVIEW_CYCLE_MONTHS} months, and can be suspended at any time.`,
  },
  {
    title: "Not a substitute for your own checks",
    body: "Donors remain responsible for their own due diligence, including sanctions screening, anti-money-laundering obligations, tax treatment and the rules of their own jurisdiction. None of these are assessed.",
  },
];

export interface LifecycleStage {
  name: string;
  timing: string;
  description: string;
}

export const LIFECYCLE: LifecycleStage[] = [
  {
    name: "Application",
    timing: "Day 0",
    description: "The organization applies, agrees to the standard's terms and is listed as Applied. No status is shown as met.",
  },
  {
    name: "Initial assessment",
    timing: "Typically 4 to 8 weeks",
    description: "Categories are reviewed in order, starting with legal registration. Each category's status is published as it is decided.",
  },
  {
    name: "Tier decision",
    timing: "After second sign-off",
    description: `A second reviewer confirms the tier. The organization sees the findings and has ${RIGHT_OF_REPLY_DAYS} days to reply before they are published.`,
  },
  {
    name: "Monitoring",
    timing: "Continuous",
    description: `Project updates are watched for warning signs. The organization must report material changes within ${MATERIAL_CHANGE_NOTICE_DAYS} days.`,
  },
  {
    name: "Annual review",
    timing: `Month ${REVIEW_CYCLE_MONTHS}`,
    description: "A full re-review of every category. Evidence that has gone out of date must be renewed.",
  },
  {
    name: "Overdue, then lapsed",
    timing: `Up to ${GRACE_PERIOD_DAYS} days after expiry`,
    description: `If the annual review is not completed, the profile shows Review overdue. After ${GRACE_PERIOD_DAYS} days, every category reverts to Not assessed.`,
  },
];

export const MATERIAL_CHANGES = [
  "Change of director, chair or authorised signatories",
  "Change of legal form, registration or bank account",
  "Annual budget growing by more than 50%",
  "Moving into a new oblast or sector",
  "A credible complaint or allegation, from any source",
  "Loss of a major donor because of concerns about conduct",
];

export const UNVERIFIABLE_CASES = [
  {
    title: "Records lost or inaccessible",
    body: `When records were destroyed, are held in occupied territory, or a registry is unavailable, the category is marked Unable to verify and the reason is published. The organization may use an alternative evidence route, such as reconstructing records from bank statements or obtaining references from two established partners. This can support Partially meets, never Meets standard, and expires after ${ALTERNATIVE_EVIDENCE_MAX_MONTHS} months unless grade A or B evidence is obtained.`,
  },
  {
    title: "Access prevented by security",
    body: "When a site cannot safely be visited, live remote verification or a vetted field partner may stand in for a visit. The method used is recorded on the profile. Reviewers are never asked to take security risks to complete a review.",
  },
  {
    title: "Contradictory evidence or red flags",
    body: "The category returns to In review and is escalated to a second reviewer. The organization is asked to explain. Unresolved contradictions mean the category cannot be marked as meeting the standard.",
  },
  {
    title: "No response from the organization",
    body: `If requested evidence is not provided within ${TRIGGERED_REVIEW_DAYS} days, the affected categories revert to Not assessed, and the tier is recalculated.`,
  },
  {
    title: "Credible allegation of serious misconduct",
    body: "When there is a credible allegation of fraud, diversion of aid or serious safeguarding failure, the status is suspended immediately and the profile is marked Status suspended. Its projects are removed from Current Needs, and donors who saved or funded it are notified. After investigation the status is reinstated, lowered, or the listing is removed. The reason for any removal is published as a category, such as financial irregularity.",
  },
];

export const REVIEWER_SAFEGUARDS = [
  {
    title: "Two-person rule",
    body: "Every tier decision is made by a lead reviewer and confirmed by a second reviewer who did not take part in the assessment. Financial controls and safeguarding findings always need both reviewers.",
  },
  {
    title: "Qualified, Ukrainian-speaking reviewers",
    body: "Reviewers are trained in the standard and work in Ukrainian. Financial findings are reviewed by someone with an accounting qualification.",
  },
  {
    title: "Conflicts of interest",
    body: "Reviewers declare their interests. No one may review an organization they have worked for, funded, or partnered with in the last 24 months.",
  },
  {
    title: "Rotation",
    body: "The same reviewer may not lead two consecutive annual reviews of the same organization.",
  },
  {
    title: "No payment for outcomes",
    body: "Reviews are not paid for by the organization being reviewed, and nobody involved is paid more for a higher tier.",
  },
  {
    title: "Appeals",
    body: `Organizations may appeal a decision within ${APPEAL_WINDOW_DAYS} days to a panel independent of the original reviewers. Decisions changed on appeal are recorded on the profile.`,
  },
];

export const PUBLISHED_VS_PRIVATE = {
  published: [
    "Status in each category, with the reviewer's note",
    "Date of last review and date the next review is due",
    "Verification method, such as a site visit or remote verification",
    "Any suspension, appeal outcome or removal, with its reason category",
    "A signed portable record that the organization owns and can share with any funder",
    "Oblasts where it works and its funding gap, unless it chooses to withhold them",
  ],
  private: [
    "The underlying documents, which are reviewed and never published",
    "Personal details of staff, volunteers and the people they serve",
    "Locations more precise than oblast level, for security, and oblasts too if the organization withholds them",
    "The content of complaints, beyond the fact that a review was triggered",
  ],
};

export const OPEN_QUESTIONS = [
  "Mapping each criterion to existing frameworks, such as the Core Humanitarian Standard and donors' existing partner assessments, to avoid duplicating work.",
  "Who convenes the founding Standards Council, and how its first election can be fair while few organizations are listed.",
  "Whether an existing assessment by a major donor or UN agency should count as evidence for some categories.",
  "Whether the light track's community-group route to governance is enough for funders with strict compliance rules.",
];

export const UPDATE_WITHIN_DAYS_OF_MILESTONE = 14;
export const FINAL_REPORT_WITHIN_DAYS = 60;

/** What every listed project commits to report. Checked later under Reporting track record. */
export const REPORTING_COMMITMENTS = [
  {
    title: "Milestone updates",
    body: `A dated update within ${UPDATE_WITHIN_DAYS_OF_MILESTONE} days of each milestone, saying whether it was met.`,
  },
  {
    title: "Delays and changes",
    body: `Any delay, cost change or change of scope is published within ${UPDATE_WITHIN_DAYS_OF_MILESTONE} days, with the reason and the revised plan.`,
  },
  {
    title: "Spending against budget",
    body: "A breakdown of spending by budget line once half of the funds are spent, and again at completion.",
  },
  {
    title: "Final report",
    body: `Outcomes and final spending within ${FINAL_REPORT_WITHIN_DAYS} days of completion. A sample of reported figures is reconciled with records at the next review.`,
  },
];

// Governance. The registry is shared trust infrastructure, not a certifier:
// Ukrainian civil society holds authority over the standard, and neither the
// platform operator nor funders can change it or influence individual decisions.

export const REGISTRY_PRINCIPLE =
  "The registry does not determine which Ukrainian organizations are worthy of funding. It provides portable evidence that allows organizations and funders to make their own decisions.";

export const COUNCIL_TERM_YEARS = 2;
export const CONSULTATION_DAYS = 60;
export const CHANGE_NOTICE_MONTHS = 6;
export const MINUTES_PUBLISHED_DAYS = 14;
export const COMPLAINT_RESPONSE_DAYS = 30;
export const MAX_SINGLE_FUNDER_SHARE = 20; // percent of the review function's budget
export const STANDARD_REVIEW_YEARS = 2;
export const SAMPLE_RE_REVIEW_PERCENT = 10;

export interface GovernanceSeat {
  seats: number;
  holder: string;
  chosenBy: string;
  votes: boolean;
}

export const STANDARDS_COUNCIL: GovernanceSeat[] = [
  {
    seats: 5,
    holder: "Ukrainian civil-society organizations",
    chosenBy:
      "Elected by listed organizations, one vote each whatever their size or tier, including Applied. At least two seats go to organizations with annual budgets under $250,000, and at least one to an organization working in front-line or recently de-occupied areas.",
    votes: true,
  },
  {
    seats: 2,
    holder: "People who receive aid",
    chosenBy: "Nominated by Ukrainian associations of displaced people, older people, veterans and people with disabilities.",
    votes: true,
  },
  {
    seats: 2,
    holder: "Independent Ukrainian experts",
    chosenBy: "One in finance and audit, one in safeguarding and protection, appointed by the elected members.",
    votes: true,
  },
  {
    seats: 2,
    holder: "Funders",
    chosenBy: "Rotating observers. They take part in consultations but cannot vote.",
    votes: false,
  },
  {
    seats: 1,
    holder: "Platform operator",
    chosenBy: "Acts as secretariat: prepares papers and publishes decisions. Cannot vote.",
    votes: false,
  },
];

export const COUNCIL_RULES = [
  `All voting members are based in Ukraine or are displaced Ukrainians. The chair is elected from the civil-society seats.`,
  `Terms last ${COUNCIL_TERM_YEARS} years, are staggered so the Council never turns over at once, and are limited to two in a row.`,
  "The Council sets the standard. It never decides individual cases, so the body that writes the rules is not the one applying them.",
];

export interface DecisionRight {
  decision: string;
  decidedBy: string;
  how: string;
  limit: string;
}

export const DECISION_RIGHTS: DecisionRight[] = [
  {
    decision: "Change criteria, categories or tiers",
    decidedBy: "Standards Council",
    how: `Two-thirds vote after a ${CONSULTATION_DAYS}-day public consultation in Ukrainian and English.`,
    limit: `Never retroactive. A change applies to reviews only after ${CHANGE_NOTICE_MONTHS} months' notice.`,
  },
  {
    decision: "Decide an individual organization's status",
    decidedBy: "Two accredited reviewers",
    how: "Applying the standard as published, with the second reviewer confirming.",
    limit: "Council members, funders and the operator cannot request, influence or overturn a decision.",
  },
  {
    decision: "Hear an appeal",
    decidedBy: "Appeals Panel",
    how: `Three members from a roster the Council approves, none of whom reviewed the case. At least one is a lawyer qualified in Ukraine. Appeals are open for ${APPEAL_WINDOW_DAYS} days after a decision.`,
    limit: "Its decision is binding, and its reasons are published unless that would put people at risk.",
  },
  {
    decision: "Suspend a status after a credible allegation",
    decidedBy: "Reviewers with the Integrity Officer",
    how: "Immediately, when there is a credible allegation of fraud, diversion of aid or serious safeguarding failure.",
    limit: `The Appeals Panel must confirm or lift the suspension within ${COMPLAINT_RESPONSE_DAYS} days.`,
  },
  {
    decision: "Accredit or remove reviewers",
    decidedBy: "Standards Council",
    how: "On the recommendation of the Integrity Officer, using published accreditation criteria.",
    limit: "No reviewer may be removed because of the outcome of a decision they made in good faith.",
  },
  {
    decision: "Set the review function's budget",
    decidedBy: "Standards Council",
    how: `Funded from pooled contributions, with no single funder giving more than ${MAX_SINGLE_FUNDER_SHARE}% of the budget.`,
    limit: "No fee per pledge, and nothing paid by the organization being reviewed.",
  },
  {
    decision: "Run the software and publish records",
    decidedBy: "Platform operator",
    how: "Publishes decisions exactly as made and keeps the record available to the organization it describes.",
    limit: "Cannot change the standard, alter a decision, rank organizations or sell placement.",
  },
];

export const ACCOUNTABILITY_MEASURES = [
  {
    title: "Reviewer accountability",
    body: `Each year, ${SAMPLE_RE_REVIEW_PERCENT}% of decisions are re-reviewed blind by a different team. Disagreement rates are published by review team, and repeated unexplained disagreement leads to retraining or loss of accreditation.`,
  },
  {
    title: "Conflicts of interest",
    body: "Council members, panel members, reviewers and the Integrity Officer are listed in a public register of interests. They step aside from anything concerning an organization they have worked for, funded, partnered with or competed against for the same grant in the last 24 months. Council members' own organizations are reviewed by a team the Appeals Panel appoints.",
  },
  {
    title: "Complaints about the registry itself",
    body: `Anyone can complain about the registry, including organizations, people who receive aid, donors and reviewers. Complaints can be anonymous and go to an Integrity Officer who reports to the Council, not to the operator. Each gets a response within ${COMPLAINT_RESPONSE_DAYS} days, and a summary of all complaints is published each year.`,
  },
  {
    title: "Open decision-making",
    body: `Council agendas, minutes and recorded votes are published in Ukrainian and English within ${MINUTES_PUBLISHED_DAYS} days.`,
  },
  {
    title: "Periodic review of the standard",
    body: `Every ${STANDARD_REVIEW_YEARS} years an independent evaluation is published. It covers who the standard leaves out, rates of Unable to verify by oblast (to catch bias against front-line organizations), appeal outcomes, the time and cost to organizations, and overlap with existing due-diligence passports. The Council must publish its response.`,
  },
];

export const GOVERNANCE_STATUS =
  "None of these bodies exists yet. Version 0.1 of this standard was drafted by the prototype's designers, outside Ukraine. Under this proposal it has no authority until a founding Standards Council ratifies, amends or rejects it.";

// Proportionate review. What is asked of an organization scales with its size,
// and funders are asked to accept the track that fits their grant rather than
// repeat the review. Tracks change the scope of review, never what a status means.

export type ReviewTrack = "light" | "standard" | "full";

export const LIGHT_TRACK_MAX_BUDGET_USD = 150_000;
export const FULL_TRACK_MIN_BUDGET_USD = 1_000_000;

export function trackForBudget(annualBudgetUsd: number): ReviewTrack {
  if (annualBudgetUsd < LIGHT_TRACK_MAX_BUDGET_USD) return "light";
  if (annualBudgetUsd > FULL_TRACK_MIN_BUDGET_USD) return "full";
  return "standard";
}

export interface TrackDefinition {
  name: string;
  whoFor: string;
  categories: VerificationCategoryId[];
  differences: string[];
  typicalDuration: string;
  /** Largest single grant for which this track is proportionate; null means no upper limit. */
  proportionateGrantUpToUsd: number | null;
}

export const REVIEW_TRACKS: Record<ReviewTrack, TrackDefinition> = {
  light: {
    name: "Light track",
    whoFor: "Organizations and volunteer groups with annual budgets under $150,000",
    categories: ["legal-registration", "governance", "financial-controls", "safeguarding"],
    differences: [
      "Governance can be met through a community-group route: two named accountable people, a written record of decisions, and two people signing off every payment, instead of a board of three.",
      "Financial controls need a bank account in the organization's name and two-person payment sign-off. No annual statements or procurement policy.",
      "Safeguarding needs a signed code of conduct, a named focal point and a working way to complain. No training records.",
      "Operational capacity and reporting track record are not reviewed. They show as Not assessed and are never counted against the organization.",
    ],
    typicalDuration: "1 to 2 weeks",
    proportionateGrantUpToUsd: 25_000,
  },
  standard: {
    name: "Standard track",
    whoFor: "Organizations with annual budgets from $150,000 to $1 million",
    categories: ["legal-registration", "governance", "financial-controls", "operational-capacity", "safeguarding", "reporting-track-record"],
    differences: ["All six categories, with the criteria as published."],
    typicalDuration: "4 to 8 weeks",
    proportionateGrantUpToUsd: 250_000,
  },
  full: {
    name: "Full track",
    whoFor: "Organizations with annual budgets over $1 million, or seeking single grants over $250,000",
    categories: ["legal-registration", "governance", "financial-controls", "operational-capacity", "safeguarding", "reporting-track-record"],
    differences: [
      "All six categories, plus externally audited annual statements.",
      "Operational capacity must include direct observation: a site visit, or a live remote walkthrough where a visit is unsafe.",
    ],
    typicalDuration: "6 to 10 weeks",
    proportionateGrantUpToUsd: null,
  },
};

/**
 * Categories a tier requires on a given track. A track never requires a category
 * it does not review, so the light track can reach every tier: there, Tier 2
 * adds financial controls, and Tier 3 adds safeguarding.
 */
export function tierRequirementsFor(tier: VerificationTier, track: ReviewTrack): VerificationCategoryId[] {
  return TIER_REQUIREMENTS[tier].filter((id) => REVIEW_TRACKS[track].categories.includes(id));
}

export const TIERS_FOLLOW_TRACK =
  "Tiers are measured against the organization's review track. On the light track, Tier 2 needs legal registration, governance and financial controls, and Tier 3 adds safeguarding. Categories outside the track never hold an organization back.";

export const PROPORTIONALITY_FOR_FUNDERS = [
  "Accept the track that fits your grant. Asking a small organization for a full review to receive $10,000 repeats work and shuts out the groups closest to the front.",
  "If your own rules require more, ask only for the specific extra item, and let the organization add it to its record so the next funder does not ask again.",
  "Categories outside an organization's track show as Not assessed. That means they were not asked for, not that anything is wrong.",
];
