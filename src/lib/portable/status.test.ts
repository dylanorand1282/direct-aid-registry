import { describe, expect, it } from "vitest";
import { organizations } from "@/data/organizations";
import { verifyRecord } from "./proof";
import { EARLIER_COPIES, issueEarlierCopy, issueRecord } from "./signed";
import { assessCurrency, currentStatus, organizationAsOf, statusPath } from "./status";

const org = (slug: string) => organizations.find((o) => o.slug === slug)!;

describe("record currency", () => {
  it("passes every current record as unaltered, in date and matching", async () => {
    for (const o of organizations) {
      const record = await issueRecord(o);
      expect(statusPath(record.credentialStatus.id)).toBe(`/organizations/${o.slug}/status.json`);
      expect(assessCurrency(record, currentStatus(o)).kind, o.slug).toBe("current");
    }
  });

  it("flags an expired copy even though its signature is valid", async () => {
    const o = org("granary-food-security");
    const copy = await issueEarlierCopy(o, "2025-07-21");
    expect((await verifyRecord(copy)).ok).toBe(true);
    expect(assessCurrency(copy, currentStatus(o))).toEqual({ kind: "expired", validUntil: "2026-07-21" });
  });

  it("flags a copy whose findings have changed since signing", async () => {
    const o = org("steppe-shelter-alliance");
    const copy = await issueEarlierCopy(o, "2026-07-02");
    expect((await verifyRecord(copy)).ok).toBe(true);
    const result = assessCurrency(copy, currentStatus(o));
    expect(result.kind).toBe("changed");
    if (result.kind === "changed") expect(result.changes.map((c) => c.category)).toEqual(["reporting-track-record"]);
  });

  it("flags a suspension and an unavailable status", async () => {
    const o = org("northbank-mobile-clinics");
    const record = await issueRecord(o);
    expect(assessCurrency(record, { ...currentStatus(o), suspended: true }).kind).toBe("suspended");
    expect(assessCurrency(record, null).kind).toBe("unknown");
  });

  it("rebuilds an earlier state from the published history only", () => {
    const o = org("open-classroom-foundation");
    expect(organizationAsOf(o, "2026-09-01", "2026-08-30").verification.categories["operational-capacity"]).toBe("in-review");
    expect(EARLIER_COPIES.every((c) => organizations.some((x) => x.slug === c.slug))).toBe(true);
  });
});
