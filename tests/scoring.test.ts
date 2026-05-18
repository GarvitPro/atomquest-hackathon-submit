import { describe, expect, it } from "vitest";
import { calculateProgress } from "@/lib/scoring";

describe("progress scoring", () => {
  it("scores min goals as achievement divided by target", () => {
    expect(calculateProgress("MIN", 100, 80)).toBe(80);
  });

  it("scores max goals as target divided by achievement", () => {
    expect(calculateProgress("MAX", 5, 10)).toBe(50);
  });

  it("scores timeline goals as complete when actual is before target", () => {
    expect(calculateProgress("TIMELINE", 30, 24)).toBe(100);
  });

  it("scores zero goals as success only when actual is zero", () => {
    expect(calculateProgress("ZERO", 0, 0)).toBe(100);
    expect(calculateProgress("ZERO", 0, 1)).toBe(0);
  });
});
