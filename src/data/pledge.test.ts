import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RESTRICTION_OPTIONS } from "./fundingTerms";
import { PLEDGE_NOTICES } from "./pledge";

// The pledge mock-up must never imply money is processed, held, transferred or tax-deductible.
const PAYMENT_UI = /checkout|card number|cvv|iban|swift|sort code|pay now|donate now|billing|tax[- ]deductible|receipt will/i;

const SOURCES = [
  "src/components/project/PledgeSimulator.tsx",
  "src/app/needs/[slug]/pledge/page.tsx",
  "src/app/needs/[slug]/page.tsx",
  "src/components/dashboard/DonorDashboard.tsx",
  "src/app/dashboard/page.tsx",
  "src/components/apply/ApplicationForm.tsx",
  "src/components/apply/ApplicationReview.tsx",
];

describe("pledge mock-up wording", () => {
  it("never uses payment-flow language in the pledge UI", () => {
    for (const file of SOURCES) expect(readFileSync(file, "utf8"), file).not.toMatch(PAYMENT_UI);
  });

  it("states in every notice that no money moves", () => {
    for (const [key, text] of Object.entries(PLEDGE_NOTICES)) {
      if (key === "storage") continue;
      expect(text, key).toMatch(/no money/i);
    }
  });

  it("only mentions tax or receipts to deny them", () => {
    for (const text of Object.values(PLEDGE_NOTICES)) {
      for (const match of text.matchAll(/[^.]*\b(tax|receipt)\b[^.]*/gi)) {
        expect(match[0], text).toMatch(/\bno\b|\bnot\b/i);
      }
    }
  });
});

describe("funding terms", () => {
  it("default to unrestricted support", () => {
    expect(readFileSync("src/components/project/PledgeSimulator.tsx", "utf8")).toMatch(/useState<string>\(UNRESTRICTED\)/);
  });

  it("describe restrictions by their consequences, never as the more responsible choice", () => {
    for (const option of Object.values(RESTRICTION_OPTIONS)) {
      expect(option.body).not.toMatch(/responsib|accountab|safer|exactly where|know where|peace of mind|trust/i);
    }
  });
});
