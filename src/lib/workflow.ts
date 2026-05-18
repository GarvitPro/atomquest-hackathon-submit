import { calculateSheetProgress } from "@/lib/scoring";
import type {
  AuditAction,
  AuditLog,
  DemoState,
  Goal,
  GoalStatus,
  NotificationEvent,
  Quarter,
  SheetStatus,
} from "@/lib/types";
import { validateGoalsForSubmission } from "@/lib/validation";

type WorkflowResult = {
  ok: boolean;
  message: string;
  state: DemoState;
};

const stamp = () => new Date().toISOString();

const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const clone = (state: DemoState): DemoState => ({
  ...state,
  users: [...state.users],
  goalSheets: state.goalSheets.map((sheet) => ({
    ...sheet,
    goals: sheet.goals.map((goal) => ({ ...goal })),
  })),
  checkIns: state.checkIns.map((checkIn) => ({ ...checkIn })),
  auditLogs: state.auditLogs.map((entry) => ({ ...entry })),
  notifications: state.notifications.map((entry) => ({ ...entry })),
  escalationRules: state.escalationRules.map((rule) => ({ ...rule })),
  cycleWindows: state.cycleWindows.map((window) => ({ ...window })),
});

const actorName = (state: DemoState, actorId: string) =>
  state.users.find((user) => user.id === actorId)?.name ?? "Demo user";

const employeeName = (state: DemoState, employeeId: string) =>
  state.users.find((user) => user.id === employeeId)?.name ?? "Employee";

const addAudit = (
  state: DemoState,
  actorId: string,
  action: AuditAction,
  entity: string,
  message: string,
) => {
  const entry: AuditLog = {
    id: id("audit"),
    actorId,
    actorName: actorName(state, actorId),
    action,
    entity,
    message,
    createdAt: stamp(),
  };

  state.auditLogs = [entry, ...state.auditLogs];
};

const addNotification = (
  state: DemoState,
  recipientId: string,
  channel: NotificationEvent["channel"],
  title: string,
  message: string,
) => {
  const notification: NotificationEvent = {
    id: id("note"),
    channel,
    recipientId,
    title,
    message,
    status: "MOCKED",
    createdAt: stamp(),
  };

  state.notifications = [notification, ...state.notifications];
};

const findSheet = (state: DemoState, employeeId: string) =>
  state.goalSheets.find((sheet) => sheet.employeeId === employeeId);

const findManager = (state: DemoState, employeeId: string) => {
  const employee = state.users.find((user) => user.id === employeeId);
  return state.users.find((user) => user.id === employee?.managerId);
};

export function upsertGoalState(
  state: DemoState,
  employeeId: string,
  actorId: string,
  goal: Omit<Goal, "id" | "ownerId" | "updatedAt"> & { id?: string },
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet) {
    return { ok: false, message: "Goal sheet was not found.", state };
  }

  if (sheet.locked) {
    return {
      ok: false,
      message: "This sheet is locked. Ask HR to unlock it before editing goals.",
      state,
    };
  }

  const goalId = goal.id ?? id("goal");
  const existing = sheet.goals.find((item) => item.id === goalId);
  const nextGoal: Goal = {
    ...goal,
    id: goalId,
    ownerId: employeeId,
    updatedAt: stamp(),
  };

  if (existing) {
    sheet.goals = sheet.goals.map((item) =>
      item.id === goalId ? { ...item, ...nextGoal } : item,
    );
  } else {
    sheet.goals = [...sheet.goals, nextGoal];
  }

  sheet.status = sheet.status === "RETURNED" ? "DRAFT" : sheet.status;
  sheet.updatedAt = stamp();
  addAudit(
    next,
    actorId,
    existing ? "GOAL_UPDATED" : "GOAL_CREATED",
    sheet.id,
    `${actorName(next, actorId)} ${existing ? "updated" : "added"} "${goal.title}".`,
  );

  return {
    ok: true,
    message: existing ? "Goal updated." : "Goal added.",
    state: next,
  };
}

export function removeGoalState(
  state: DemoState,
  employeeId: string,
  actorId: string,
  goalId: string,
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet || sheet.locked) {
    return { ok: false, message: "This goal cannot be removed right now.", state };
  }

  sheet.goals = sheet.goals.filter((goal) => goal.id !== goalId);
  sheet.updatedAt = stamp();
  addAudit(next, actorId, "GOAL_UPDATED", sheet.id, "Removed a draft goal.");

  return { ok: true, message: "Goal removed.", state: next };
}

export function submitGoalSheetState(
  state: DemoState,
  employeeId: string,
  actorId: string,
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet) {
    return { ok: false, message: "Goal sheet was not found.", state };
  }

  const validation = validateGoalsForSubmission(sheet.goals);

  if (!validation.ok) {
    return {
      ok: false,
      message: validation.errors.join(" "),
      state,
    };
  }

  sheet.status = "SUBMITTED";
  sheet.locked = false;
  sheet.submittedAt = stamp();
  sheet.updatedAt = stamp();

  const manager = findManager(next, employeeId);
  addAudit(
    next,
    actorId,
    "SHEET_SUBMITTED",
    sheet.id,
    `${employeeName(next, employeeId)} submitted goals for manager review.`,
  );

  if (manager) {
    addNotification(
      next,
      manager.id,
      "EMAIL",
      `${employeeName(next, employeeId)} submitted goals`,
      "A goal sheet is waiting in your approval queue.",
    );
    addNotification(
      next,
      manager.id,
      "TEAMS",
      "Approval requested",
      `${employeeName(next, employeeId)} is ready for your review.`,
    );
  }

  return { ok: true, message: "Goal sheet submitted.", state: next };
}

export function changeSheetStatusState(
  state: DemoState,
  employeeId: string,
  managerId: string,
  status: Extract<SheetStatus, "APPROVED" | "RETURNED">,
  comment?: string,
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet) {
    return { ok: false, message: "Goal sheet was not found.", state };
  }

  if (status === "APPROVED") {
    sheet.status = "APPROVED";
    sheet.locked = true;
    sheet.approvedAt = stamp();
    sheet.returnedComment = undefined;
    addAudit(
      next,
      managerId,
      "SHEET_APPROVED",
      sheet.id,
      `${actorName(next, managerId)} approved ${employeeName(next, employeeId)}'s goals.`,
    );
    addNotification(
      next,
      employeeId,
      "TEAMS",
      "Goals approved",
      "Your goals are locked for the current cycle.",
    );
  } else {
    sheet.status = "RETURNED";
    sheet.locked = false;
    sheet.returnedAt = stamp();
    sheet.returnedComment =
      comment?.trim() || "Manager requested a small rework before approval.";
    addAudit(
      next,
      managerId,
      "SHEET_RETURNED",
      sheet.id,
      `${actorName(next, managerId)} returned ${employeeName(next, employeeId)}'s goals for rework.`,
    );
    addNotification(
      next,
      employeeId,
      "EMAIL",
      "Goals returned for rework",
      sheet.returnedComment,
    );
  }

  sheet.updatedAt = stamp();

  return {
    ok: true,
    message: status === "APPROVED" ? "Goal sheet approved." : "Goal sheet returned.",
    state: next,
  };
}

export function updateAchievementState(
  state: DemoState,
  employeeId: string,
  actorId: string,
  goalId: string,
  actual: number,
  status: GoalStatus,
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet) {
    return { ok: false, message: "Goal sheet was not found.", state };
  }

  const sourceGoal = sheet.goals.find((goal) => goal.id === goalId);
  const sharedGroupId = sourceGoal?.sharedGroupId;
  const updatedAt = stamp();

  next.goalSheets = next.goalSheets.map((item) => {
    const touchesSheet = item.goals.some((goal) =>
      sharedGroupId
        ? goal.sharedGroupId === sharedGroupId
        : item.employeeId === employeeId && goal.id === goalId,
    );

    return {
      ...item,
      updatedAt: touchesSheet ? updatedAt : item.updatedAt,
      goals: item.goals.map((goal) => {
      const shouldSync = sharedGroupId
        ? goal.sharedGroupId === sharedGroupId
        : item.employeeId === employeeId && goal.id === goalId;

      if (!shouldSync) {
        return goal;
      }

      return {
        ...goal,
        actual,
        status,
        updatedAt,
      };
    }),
    };
  });
  addAudit(
    next,
    actorId,
    "ACHIEVEMENT_UPDATED",
    goalId,
    `${actorName(next, actorId)} updated actual achievement.`,
  );

  return { ok: true, message: "Achievement updated.", state: next };
}

export function logCheckInState(
  state: DemoState,
  employeeId: string,
  managerId: string,
  quarter: Quarter,
  comment: string,
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet) {
    return { ok: false, message: "Goal sheet was not found.", state };
  }

  const checkIn = {
    id: id("check"),
    employeeId,
    managerId,
    quarter,
    comment,
    averageProgress: calculateSheetProgress(sheet),
    createdAt: stamp(),
  };

  next.checkIns = [checkIn, ...next.checkIns];
  addAudit(
    next,
    managerId,
    "CHECK_IN_LOGGED",
    sheet.id,
    `${actorName(next, managerId)} logged a ${quarter} check-in for ${employeeName(next, employeeId)}.`,
  );

  return { ok: true, message: "Check-in saved.", state: next };
}

export function unlockSheetState(
  state: DemoState,
  employeeId: string,
  adminId: string,
  reason: string,
): WorkflowResult {
  const next = clone(state);
  const sheet = findSheet(next, employeeId);

  if (!sheet) {
    return { ok: false, message: "Goal sheet was not found.", state };
  }

  sheet.locked = false;
  sheet.status = "RETURNED";
  sheet.returnedComment = reason || "Unlocked by HR for exception handling.";
  sheet.updatedAt = stamp();
  addAudit(
    next,
    adminId,
    "SHEET_UNLOCKED",
    sheet.id,
    `${actorName(next, adminId)} unlocked ${employeeName(next, employeeId)}'s sheet.`,
  );

  return { ok: true, message: "Sheet unlocked.", state: next };
}

export function pushSharedGoalState(
  state: DemoState,
  actorId: string,
  employeeIds: string[],
  template: Omit<Goal, "id" | "ownerId" | "updatedAt">,
): WorkflowResult {
  const next = clone(state);
  const sharedGroupId = id("shared");

  next.goalSheets = next.goalSheets.map((sheet) => {
    if (!employeeIds.includes(sheet.employeeId) || sheet.locked) {
      return sheet;
    }

    const sharedGoal: Goal = {
      ...template,
      id: id("goal"),
      ownerId: sheet.employeeId,
      primaryOwnerId: actorId,
      sharedGroupId,
      updatedAt: stamp(),
    };

    return {
      ...sheet,
      goals: [...sheet.goals, sharedGoal],
      updatedAt: stamp(),
    };
  });

  addAudit(
    next,
    actorId,
    "SHARED_GOAL_PUSHED",
    sharedGroupId,
    `${actorName(next, actorId)} pushed "${template.title}" to ${employeeIds.length} employee goal sheet(s).`,
  );

  return { ok: true, message: "Shared goal pushed.", state: next };
}
