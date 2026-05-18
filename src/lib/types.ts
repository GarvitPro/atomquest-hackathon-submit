export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";

export type UoMType = "MIN" | "MAX" | "TIMELINE" | "ZERO";

export type GoalStatus = "NOT_STARTED" | "ON_TRACK" | "COMPLETED";

export type SheetStatus = "DRAFT" | "SUBMITTED" | "RETURNED" | "APPROVED";

export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";

export type NotificationChannel = "EMAIL" | "TEAMS";

export type NotificationStatus = "QUEUED" | "SENT" | "MOCKED";

export type AuditAction =
  | "GOAL_CREATED"
  | "GOAL_UPDATED"
  | "SHEET_SUBMITTED"
  | "SHEET_APPROVED"
  | "SHEET_RETURNED"
  | "SHEET_UNLOCKED"
  | "ACHIEVEMENT_UPDATED"
  | "CHECK_IN_LOGGED"
  | "SHARED_GOAL_PUSHED";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  title: string;
  department: string;
  managerId?: string;
  avatarInitials: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  thrustArea: string;
  uomType: UoMType;
  target: number;
  actual: number;
  weightage: number;
  status: GoalStatus;
  ownerId: string;
  primaryOwnerId?: string;
  sharedGroupId?: string;
  managerNote?: string;
  updatedAt: string;
}

export interface GoalSheet {
  id: string;
  employeeId: string;
  cycle: string;
  status: SheetStatus;
  locked: boolean;
  goals: Goal[];
  submittedAt?: string;
  approvedAt?: string;
  returnedAt?: string;
  returnedComment?: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  employeeId: string;
  managerId: string;
  quarter: Quarter;
  comment: string;
  averageProgress: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  entity: string;
  message: string;
  createdAt: string;
}

export interface NotificationEvent {
  id: string;
  channel: NotificationChannel;
  recipientId: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  trigger: string;
  firstNudgeDays: number;
  escalationPath: string[];
  active: boolean;
}

export interface CycleWindow {
  period: string;
  opens: string;
  action: string;
  status: "OPEN" | "UPCOMING" | "CLOSED";
}

export interface DemoState {
  users: User[];
  goalSheets: GoalSheet[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  notifications: NotificationEvent[];
  escalationRules: EscalationRule[];
  cycleWindows: CycleWindow[];
}
