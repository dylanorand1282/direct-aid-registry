import { REFUGEES_INTERNATIONAL_2024 } from "./sources";

// Funding terms. Unrestricted support is the default: the product should not
// suggest that restricting money is the more responsible choice.

export const UNRESTRICTED = "unrestricted";
export const WHOLE_PROJECT = "whole-project";

export type Restriction = "unrestricted" | "project" | "budget-line";

export function restrictionOf(designation: string): Restriction {
  if (designation === UNRESTRICTED) return "unrestricted";
  if (designation === WHOLE_PROJECT) return "project";
  return "budget-line";
}

export const RESTRICTION_OPTIONS: Record<Restriction, { label: string; body: string }> = {
  unrestricted: {
    label: "Unrestricted support to the organization",
    body: "The organization decides where it is most needed: this project, another one, or the core costs that keep it running. Reported through its annual report and accounts.",
  },
  project: {
    label: "This project, as budgeted",
    body: "Used for this project's published budget, including its core-costs line. Reported through the project's milestone updates and final report.",
  },
  "budget-line": {
    label: "One budget line",
    body: "The organization must track and report this line separately, and cannot move the money if needs change.",
  },
};

export const CORE_COSTS = {
  definition:
    "Core organizational costs pay for what keeps an organization running: finance staff, rent and utilities, security, insurance, audits, and the systems that make accurate reporting possible.",
  realWorld: {
    figure: "23%",
    text: "Local organizations typically need about 23% overhead to cover costs and build systems. The same research found that UN agencies generally did not pass overhead on to Ukrainian sub-grantees.",
    source: REFUGEES_INTERNATIONAL_2024,
  },
} as const;
