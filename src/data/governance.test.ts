import { describe, expect, it } from "vitest";
import { DECISION_RIGHTS, OPEN_QUESTIONS, REGISTRY_PRINCIPLE, STANDARDS_COUNCIL, VERIFICATION_IS_NOT } from "./methodology";

describe("governance of the standard", () => {
  it("gives every vote to Ukrainian civil society, people who receive aid and Ukrainian experts", () => {
    const voting = STANDARDS_COUNCIL.filter((s) => s.votes).map((s) => s.holder);
    expect(voting).toEqual(["Ukrainian civil-society organizations", "People who receive aid", "Independent Ukrainian experts"]);
    for (const seat of STANDARDS_COUNCIL.filter((s) => /funder|operator/i.test(s.holder))) expect(seat.votes, seat.holder).toBe(false);
  });

  it("keeps civil-society organizations a majority of the voting seats", () => {
    const votes = STANDARDS_COUNCIL.filter((s) => s.votes).reduce((n, s) => n + s.seats, 0);
    expect(STANDARDS_COUNCIL[0].seats * 2).toBeGreaterThan(votes);
  });

  it("separates writing the standard from applying it", () => {
    const individual = DECISION_RIGHTS.find((d) => d.decision.startsWith("Decide an individual"))!;
    expect(individual.decidedBy).not.toMatch(/Council|operator|funder/i);
    const operator = DECISION_RIGHTS.find((d) => d.decidedBy === "Platform operator")!;
    expect(operator.limit).toMatch(/Cannot change the standard/);
    expect(operator.limit).toMatch(/rank organizations/);
  });

  it("states that the registry does not decide who deserves funding", () => {
    expect(REGISTRY_PRINCIPLE).toMatch(/does not determine which Ukrainian organizations are worthy of funding/);
    expect(VERIFICATION_IS_NOT[0].title).toBe("Not an endorsement, or a decision about who deserves funding");
    expect(OPEN_QUESTIONS.join(" ")).toMatch(/founding Standards Council/);
  });
});
