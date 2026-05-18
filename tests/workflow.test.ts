import { describe, expect, it } from "vitest";
import { createDemoState } from "@/lib/demo-data";
import {
  changeSheetStatusState,
  pushSharedGoalState,
  submitGoalSheetState,
  unlockSheetState,
  updateAchievementState,
} from "@/lib/workflow";

describe("workflow transitions", () => {
  it("submits a valid employee goal sheet and creates notifications", () => {
    const state = createDemoState();
    const result = submitGoalSheetState(state, "emp-1", "emp-1");

    expect(result.ok).toBe(true);
    expect(
      result.state.goalSheets.find((sheet) => sheet.employeeId === "emp-1")
        ?.status,
    ).toBe("SUBMITTED");
    expect(result.state.notifications.length).toBeGreaterThan(
      state.notifications.length,
    );
  });

  it("approves and locks a submitted sheet", () => {
    const state = createDemoState();
    const result = changeSheetStatusState(
      state,
      "emp-2",
      "mgr-1",
      "APPROVED",
    );
    const sheet = result.state.goalSheets.find(
      (item) => item.employeeId === "emp-2",
    );

    expect(result.ok).toBe(true);
    expect(sheet?.status).toBe("APPROVED");
    expect(sheet?.locked).toBe(true);
  });

  it("unlocks approved sheets through Admin exception handling", () => {
    const state = createDemoState();
    const result = unlockSheetState(state, "emp-3", "admin-1", "Scope changed.");
    const sheet = result.state.goalSheets.find(
      (item) => item.employeeId === "emp-3",
    );

    expect(result.ok).toBe(true);
    expect(sheet?.locked).toBe(false);
    expect(sheet?.status).toBe("RETURNED");
  });

  it("syncs achievement updates across shared goals", () => {
    const state = createDemoState();
    const pushed = pushSharedGoalState(state, "admin-1", ["emp-1", "emp-2"], {
      title: "Shared quality target",
      description: "Keep the shared department quality target visible.",
      thrustArea: "Quality",
      uomType: "MIN",
      target: 100,
      actual: 0,
      weightage: 10,
      status: "NOT_STARTED",
    });
    const firstSharedGoal = pushed.state.goalSheets
      .find((sheet) => sheet.employeeId === "emp-1")
      ?.goals.find((goal) => goal.sharedGroupId);

    const result = updateAchievementState(
      pushed.state,
      "emp-1",
      "emp-1",
      firstSharedGoal?.id ?? "",
      88,
      "ON_TRACK",
    );

    const syncedGoals = result.state.goalSheets
      .flatMap((sheet) => sheet.goals)
      .filter((goal) => goal.sharedGroupId === firstSharedGoal?.sharedGroupId);

    expect(syncedGoals).toHaveLength(2);
    expect(syncedGoals.every((goal) => goal.actual === 88)).toBe(true);
  });
});
