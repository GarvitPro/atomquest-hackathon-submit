import { describe, expect, it } from "vitest";
import { validateGoalsForSubmission } from "@/lib/validation";

const goal = (weightage: number) => ({
  title: "Grow pipeline",
  description: "Build a healthier qualified sales pipeline.",
  thrustArea: "Revenue Growth",
  uomType: "MIN" as const,
  target: 100,
  actual: 25,
  weightage,
});

describe("goal sheet validation", () => {
  it("accepts sheets with total weightage of 100", () => {
    const result = validateGoalsForSubmission([goal(40), goal(30), goal(30)]);

    expect(result.ok).toBe(true);
  });

  it("rejects sheets whose total weightage is not 100", () => {
    const result = validateGoalsForSubmission([goal(40), goal(30)]);

    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("exactly 100%");
  });

  it("rejects more than eight goals", () => {
    const result = validateGoalsForSubmission(Array.from({ length: 9 }, () => goal(10)));

    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("maximum of 8");
  });

  it("rejects goals below 10% weightage", () => {
    const result = validateGoalsForSubmission([goal(95), goal(5)]);

    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("at least 10%");
  });

  it("allows zero target goals for zero-defect metrics", () => {
    const result = validateGoalsForSubmission([
      goal(70),
      {
        ...goal(30),
        title: "Zero priority safety incidents",
        uomType: "ZERO",
        target: 0,
        actual: 0,
      },
    ]);

    expect(result.ok).toBe(true);
  });

  it("still rejects zero targets for non-zero metrics", () => {
    const result = validateGoalsForSubmission([{ ...goal(100), target: 0 }]);

    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("greater than zero");
  });
});
