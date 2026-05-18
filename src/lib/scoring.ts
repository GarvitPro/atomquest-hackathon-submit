import type { Goal, GoalSheet, UoMType } from "@/lib/types";

const clampProgress = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.min(Math.round(value), 150);
};

export function calculateProgress(
  uomType: UoMType,
  target: number,
  actual: number,
) {
  if (uomType !== "ZERO" && target <= 0) {
    return 0;
  }

  if (uomType !== "ZERO" && actual < 0) {
    return 0;
  }

  switch (uomType) {
    case "MIN":
      return clampProgress((actual / target) * 100);
    case "MAX":
      return actual === 0 ? 150 : clampProgress((target / actual) * 100);
    case "TIMELINE":
      return actual <= target ? 100 : clampProgress((target / actual) * 100);
    case "ZERO":
      return actual === 0 ? 100 : 0;
    default:
      return 0;
  }
}

export function calculateGoalProgress(goal: Goal) {
  return calculateProgress(goal.uomType, goal.target, goal.actual);
}

export function calculateWeightedProgress(goals: Goal[]) {
  const totalWeight = goals.reduce((sum, goal) => sum + goal.weightage, 0);

  if (goals.length === 0 || totalWeight === 0) {
    return 0;
  }

  const weighted = goals.reduce((sum, goal) => {
    return sum + calculateGoalProgress(goal) * (goal.weightage / totalWeight);
  }, 0);

  return Math.round(weighted);
}

export function calculateSheetProgress(sheet: GoalSheet) {
  return calculateWeightedProgress(sheet.goals);
}

export function progressTone(progress: number) {
  if (progress >= 90) {
    return "text-success";
  }

  if (progress >= 65) {
    return "text-info";
  }

  if (progress >= 35) {
    return "text-warning";
  }

  return "text-destructive";
}
