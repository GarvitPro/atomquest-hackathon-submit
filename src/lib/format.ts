import type { GoalStatus, Role, SheetStatus, UoMType } from "@/lib/types";

export const roleLabels: Record<Role, string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  ADMIN: "Admin / HR",
};

export const sheetStatusLabels: Record<SheetStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  RETURNED: "Returned",
  APPROVED: "Approved",
};

export const goalStatusLabels: Record<GoalStatus, string> = {
  NOT_STARTED: "Not started",
  ON_TRACK: "On track",
  COMPLETED: "Completed",
};

export const uomLabels: Record<UoMType, string> = {
  MIN: "Min",
  MAX: "Max",
  TIMELINE: "Timeline",
  ZERO: "Zero",
};

export function formatDate(value?: string) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
