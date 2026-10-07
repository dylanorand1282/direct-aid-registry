import type { DonorProfile } from "./types";

// FICTIONAL demo persona used to seed the donor dashboard mockup.
// Pledges are simulated; no money was ever moved.

export const demoDonor: DonorProfile = {
  id: "demo-donor",
  isFictional: true,
  displayName: "Demo Foundation",
  type: "foundation",
  focusSectors: ["health", "winterization", "wash"],
  focusRegions: ["kharkiv", "zaporizhzhia", "mykolaiv"],
  savedOrgSlugs: [
    "northbank-mobile-clinics",
    "steppe-shelter-alliance",
    "riverline-water-sanitation",
    "linden-psychosocial-centre",
  ],
  savedProjectSlugs: ["sumy-protected-classroom-fitout", "kherson-winter-food-parcels"],
  pledges: [
    { projectSlug: "kharkiv-second-clinic-van", designation: "unrestricted", amountUsd: 5_000, date: "2026-09-02", simulated: true },
    { projectSlug: "zaporizhzhia-winter-heating-kits", designation: "whole-project", amountUsd: 10_000, date: "2026-09-18", simulated: true },
    { projectSlug: "mykolaiv-water-point-repairs", designation: "unrestricted", amountUsd: 2_500, date: "2026-08-11", simulated: true },
    { projectSlug: "dnipro-collective-centre-repairs", designation: "whole-project", amountUsd: 7_500, date: "2026-09-10", simulated: true },
  ],
};
