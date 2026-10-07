import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ALL_FIELDS, APPLICATION_NOTICES, APPLICATION_SECTIONS, EXAMPLE_ANSWERS } from "@/data/application";
import { VERIFICATION_CATEGORY_DEFINITIONS } from "@/data/methodology";
import { categoryStatusLabel } from "./labels";
import { categoryReadiness, draftTrack, missingRequired, overallProgress, READINESS_LABEL, sanitizeDraft } from "./application";

describe("application questions", () => {
  it("say why each question is asked and who sees the answer", () => {
    expect(new Set(ALL_FIELDS.map((f) => f.id)).size).toBe(ALL_FIELDS.length);
    for (const field of ALL_FIELDS) {
      expect(field.why.length, field.id).toBeGreaterThan(20);
      expect(["published", "private"]).toContain(field.visibility);
    }
  });

  it("cover every verification category, with the evidence the standard lists", () => {
    for (const category of VERIFICATION_CATEGORY_DEFINITIONS) {
      const questions = ALL_FIELDS.filter((f) => f.supports === category.id && f.kind !== "evidence");
      expect(questions.length, category.id).toBeGreaterThan(0);
      const evidence = ALL_FIELDS.filter((f) => f.kind === "evidence" && f.evidenceFor === category.id);
      expect(evidence.map((f) => f.label)).toEqual(category.evidence);
    }
  });

  it("never publish evidence, self-assessments or personal details", () => {
    for (const field of ALL_FIELDS.filter((f) => f.visibility === "published")) {
      expect(["evidence", "answer", "ack"]).not.toContain(field.kind);
      expect(field.label).not.toMatch(/address|phone|email|passport|street|coordinates/i);
    }
  });

  it("require only the acknowledgements and the basics", () => {
    const required = ALL_FIELDS.filter((f) => f.required).map((f) => f.id);
    expect(required).toEqual(["ack.noGuarantee", "ack.selfDeclared", "ack.prototype", "legalName", "legalForm", "oblasts", "sectors", "summary"]);
    expect(missingRequired(sanitizeDraft({ values: EXAMPLE_ANSWERS }).values)).toEqual([]);
  });

  it("state that applying guarantees neither verification nor funding", () => {
    expect(APPLICATION_NOTICES.noGuarantee).toMatch(/does not guarantee verification/);
    expect(APPLICATION_NOTICES.noGuarantee).toMatch(/funding/);
  });

  it("accept no files anywhere in the form", () => {
    const form = readFileSync("src/components/apply/ApplicationForm.tsx", "utf8");
    expect(form).not.toMatch(/type=["']file["']|FileReader|FormData/);
    expect(APPLICATION_SECTIONS.flatMap((s) => s.fields).map((f) => f.kind)).not.toContain("file");
  });
});

describe("evidence readiness", () => {
  it("is never worded as a verification status", () => {
    for (const label of Object.values(READINESS_LABEL)) {
      expect(Object.values(categoryStatusLabel)).not.toContain(label);
      expect(label).not.toMatch(/meets|verified|does not|unable/i);
    }
  });

  it("routes evidence that cannot be obtained to the alternative route, not a failure", () => {
    const values = {
      "evidence.operational-capacity.0": "have",
      "evidence.operational-capacity.1": "cannot-obtain",
      "evidence.operational-capacity.2": "have",
    };
    expect(categoryReadiness("operational-capacity", values).readiness).toBe("alternative-route");
  });

  it("is ready only when every listed item is in hand", () => {
    expect(categoryReadiness("legal-registration", {}).readiness).toBe("not-started");
    const partial = { "evidence.legal-registration.0": "have", "evidence.legal-registration.1": "can-obtain" };
    expect(categoryReadiness("legal-registration", partial).readiness).toBe("gathering");
    const all = { ...partial, "evidence.legal-registration.1": "have", "evidence.legal-registration.2": "have" };
    expect(categoryReadiness("legal-registration", all).readiness).toBe("ready-for-review");
  });

  it("counts No and Not sure answers as questions to discuss", () => {
    expect(categoryReadiness("governance", { coiPolicy: "no", boardSeparate: "not-sure", paymentSeparation: "yes" }).openQuestions).toBe(2);
  });
});

describe("draft storage", () => {
  it("keeps valid answers and drops anything unknown or malformed", () => {
    const draft = sanitizeDraft({
      values: {
        legalName: "Test",
        oblasts: ["kyiv", "atlantis"],
        sectors: ["health"],
        boardSize: "three",
        unknown: "x",
        "evidence.governance.0": "cannot-obtain",
        "evidence.governance.0.reason": "security",
      },
      flagged: ["finance", "nope"],
      updatedAt: "2026-10-07T10:00:00Z",
      submitted: { ref: 42 },
    });
    expect(draft.values).toEqual({
      legalName: "Test",
      sectors: ["health"],
      "evidence.governance.0": "cannot-obtain",
      "evidence.governance.0.reason": "security",
    });
    expect(draft.flagged).toEqual(["finance"]);
    expect(draft.submitted).toBeNull();
  });

  it("round-trips the example without loss", () => {
    expect(sanitizeDraft({ values: EXAMPLE_ANSWERS }).values).toEqual(EXAMPLE_ANSWERS);
  });

  it("treats garbage as an empty draft", () => {
    expect(sanitizeDraft("nonsense").values).toEqual({});
    expect(sanitizeDraft(null).flagged).toEqual([]);
  });
});

describe("proportionate application", () => {
  it("picks the track from the budget band unless the applicant chooses one", () => {
    expect(draftTrack({})).toBe("standard");
    expect(draftTrack({ budgetBand: "under-50k" })).toBe("light");
    expect(draftTrack({ budgetBand: "over-1m" })).toBe("full");
    expect(draftTrack({ budgetBand: "under-50k", track: "standard" })).toBe("standard");
  });

  it("asks a small group far fewer questions", () => {
    const light = overallProgress({ budgetBand: "under-50k" }).total;
    const standard = overallProgress({ budgetBand: "150k-1m" }).total;
    expect(light).toBeLessThan(standard * 0.6);
  });

  it("marks categories outside the track as not asked, never as missing", () => {
    expect(categoryReadiness("operational-capacity", { budgetBand: "under-50k" }).readiness).toBe("not-required");
    expect(categoryReadiness("reporting-track-record", { budgetBand: "under-50k" }).readiness).toBe("not-required");
    expect(categoryReadiness("legal-registration", { budgetBand: "under-50k" }).totalEvidence).toBe(1);
  });
});
