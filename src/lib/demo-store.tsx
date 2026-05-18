"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createDemoState } from "@/lib/demo-data";
import type { DemoState, Goal, GoalStatus, Quarter } from "@/lib/types";
import {
  changeSheetStatusState,
  logCheckInState,
  pushSharedGoalState,
  removeGoalState,
  submitGoalSheetState,
  unlockSheetState,
  updateAchievementState,
  upsertGoalState,
} from "@/lib/workflow";

type Result = {
  ok: boolean;
  message: string;
};

type DemoStore = {
  state: DemoState;
  hydrated: boolean;
  resetDemo: () => void;
  upsertGoal: (
    employeeId: string,
    actorId: string,
    goal: Omit<Goal, "id" | "ownerId" | "updatedAt"> & { id?: string },
  ) => Result;
  removeGoal: (employeeId: string, actorId: string, goalId: string) => Result;
  submitGoalSheet: (employeeId: string, actorId: string) => Result;
  approveGoalSheet: (employeeId: string, managerId: string) => Result;
  returnGoalSheet: (
    employeeId: string,
    managerId: string,
    comment: string,
  ) => Result;
  updateAchievement: (
    employeeId: string,
    actorId: string,
    goalId: string,
    actual: number,
    status: GoalStatus,
  ) => Result;
  logCheckIn: (
    employeeId: string,
    managerId: string,
    quarter: Quarter,
    comment: string,
  ) => Result;
  unlockSheet: (employeeId: string, adminId: string, reason: string) => Result;
  pushSharedGoal: (
    actorId: string,
    employeeIds: string[],
    template: Omit<Goal, "id" | "ownerId" | "updatedAt">,
  ) => Result;
};

const STORAGE_KEY = "atomquest-demo-state-v1";

const DemoStoreContext = createContext<DemoStore | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createDemoState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState(JSON.parse(saved) as DemoState);
      }
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const apply = useCallback((workflowResult: { state: DemoState } & Result) => {
    if (workflowResult.ok) {
      setState(workflowResult.state);
    }

    return { ok: workflowResult.ok, message: workflowResult.message };
  }, []);

  const value = useMemo<DemoStore>(
    () => ({
      state,
      hydrated,
      resetDemo: () => {
        const fresh = createDemoState();
        setState(fresh);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      },
      upsertGoal: (employeeId, actorId, goal) =>
        apply(upsertGoalState(state, employeeId, actorId, goal)),
      removeGoal: (employeeId, actorId, goalId) =>
        apply(removeGoalState(state, employeeId, actorId, goalId)),
      submitGoalSheet: (employeeId, actorId) =>
        apply(submitGoalSheetState(state, employeeId, actorId)),
      approveGoalSheet: (employeeId, managerId) =>
        apply(changeSheetStatusState(state, employeeId, managerId, "APPROVED")),
      returnGoalSheet: (employeeId, managerId, comment) =>
        apply(
          changeSheetStatusState(
            state,
            employeeId,
            managerId,
            "RETURNED",
            comment,
          ),
        ),
      updateAchievement: (employeeId, actorId, goalId, actual, status) =>
        apply(
          updateAchievementState(
            state,
            employeeId,
            actorId,
            goalId,
            actual,
            status,
          ),
        ),
      logCheckIn: (employeeId, managerId, quarter, comment) =>
        apply(logCheckInState(state, employeeId, managerId, quarter, comment)),
      unlockSheet: (employeeId, adminId, reason) =>
        apply(unlockSheetState(state, employeeId, adminId, reason)),
      pushSharedGoal: (actorId, employeeIds, template) =>
        apply(pushSharedGoalState(state, actorId, employeeIds, template)),
    }),
    [apply, hydrated, state],
  );

  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const context = useContext(DemoStoreContext);

  if (!context) {
    throw new Error("useDemoStore must be used inside DemoStoreProvider.");
  }

  return context;
}
