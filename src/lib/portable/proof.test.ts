import { describe, expect, it } from "vitest";
import { getOrganization, getOrganizations } from "@/lib/queries";
import { base58btcDecode, base58btcEncode, canonicalize } from "./canonical";
import { signRecord, verifyRecord } from "./proof";
import { buildUnsignedRecord } from "./record";

const sign = (slug: string) => signRecord(buildUnsignedRecord(getOrganization(slug)!), "2026-10-07T00:00:00Z");

describe("portable record", () => {
  it("canonicalizes with sorted keys and no whitespace (RFC 8785)", () => {
    expect(canonicalize({ b: [1, "x", null], a: { d: true, c: 2 } })).toBe('{"a":{"c":2,"d":true},"b":[1,"x",null]}');
  });

  it("round-trips base58btc, including leading zero bytes", () => {
    const bytes = new Uint8Array([0, 0, 1, 255, 128, 7]);
    expect(base58btcDecode(base58btcEncode(bytes))).toEqual(bytes);
  });

  it("signs every organization's record so it verifies without the website", async () => {
    for (const org of getOrganizations()) {
      const result = await verifyRecord(JSON.parse(JSON.stringify(await sign(org.slug))));
      expect(result.ok, org.slug).toBe(true);
    }
  });

  it("detects any change to the record, including a changed status", async () => {
    const record = JSON.parse(JSON.stringify(await sign("open-classroom-foundation")));
    record.credentialSubject.categories[3].status = "meets-standard";
    expect(await verifyRecord(record)).toMatchObject({ ok: false });
  });

  it("rejects a record checked against a different trusted key", async () => {
    const record = await sign("northbank-mobile-clinics");
    const otherKey = "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK";
    expect((await verifyRecord(record, otherKey)).ok).toBe(false);
  });

  it("carries methodology version, dates, provenance, limits and Unable to verify findings", () => {
    const record = buildUnsignedRecord(getOrganization("open-classroom-foundation")!);
    expect(record.credentialSubject.standard.version).toMatch(/^0\.1/);
    expect(record.validFrom).toBe("2026-08-30T00:00:00Z");
    expect(record.validUntil).toBe("2027-08-30T00:00:00Z");
    expect(record.evidence[0].leadReviewer).toMatch(/^REV-\d{2}$/);
    expect(record.evidence[0].leadReviewer).not.toBe(record.evidence[0].secondReviewer);
    for (const c of record.credentialSubject.categories) expect(c.limit.length).toBeGreaterThan(10);
    expect(record.credentialSubject.unableToVerify).toEqual([
      expect.objectContaining({ category: "operational-capacity", isFindingAgainstOrganization: false }),
    ]);
    expect(record.termsOfUse[0].ownership).toMatch(/belongs to the organization/);
    expect(record.credentialSubject.isFictional).toBe(true);
  });

  it("exports an Applied organization with no review dates", () => {
    const record = buildUnsignedRecord(getOrganization("hearth-livelihoods-cooperative")!);
    expect(record.validUntil).toBeUndefined();
    expect(record.credentialSubject.lastReviewed).toBeNull();
  });
});
