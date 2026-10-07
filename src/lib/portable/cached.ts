import { getOrganization } from "@/lib/queries";
import { recordFingerprint } from "./proof";
import { EARLIER_COPIES, issueEarlierCopy, issueRecord } from "./signed";

/** Signing is deterministic, so the signed record can be cached and prerendered. */
export async function cachedRecord(slug: string) {
  "use cache";
  const org = getOrganization(slug);
  if (!org) return null;
  const record = await issueRecord(org);
  return { record, fingerprint: await recordFingerprint(record) };
}

/** Example copies that have since expired or gone out of date, as JSON text for the checker. */
export async function cachedEarlierCopies() {
  "use cache";
  return Promise.all(
    EARLIER_COPIES.map(async ({ slug, signedOn, label }) => {
      const org = getOrganization(slug)!;
      return { key: `${slug}@${signedOn}`, label: `${org.name}: ${label}`, json: JSON.stringify(await issueEarlierCopy(org, signedOn), null, 2) };
    }),
  );
}
