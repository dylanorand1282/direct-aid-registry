import type { Organization } from "@/data/types";
import { RECORDS_AS_OF } from "@/data/verificationEvents";
import { signRecord, type SignedRecord } from "./proof";
import { buildUnsignedRecord } from "./record";
import { organizationAsOf } from "./status";

/** The signed record as the registry issues it. Signed with a fixed date so builds are reproducible. */
export function issueRecord(org: Organization): Promise<SignedRecord> {
  return signRecord(buildUnsignedRecord(org), `${RECORDS_AS_OF}T00:00:00Z`);
}

/** Older example copies, for showing what a checker does with expired and out-of-date records. */
export const EARLIER_COPIES = [
  { slug: "granary-food-security", signedOn: "2025-07-21", label: "copy from the 2025 review (expired)" },
  { slug: "steppe-shelter-alliance", signedOn: "2026-07-02", label: "copy from the July 2026 review (a finding has changed since)" },
] as const;

export function issueEarlierCopy(org: Organization, signedOn: string): Promise<SignedRecord> {
  return signRecord(buildUnsignedRecord(organizationAsOf(org, signedOn, signedOn), signedOn), `${signedOn}T00:00:00Z`);
}
