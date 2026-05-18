import { Badge } from "@/components/ui/badge";
import type { GoalStatus, SheetStatus } from "@/lib/types";
import { goalStatusLabels, sheetStatusLabels } from "@/lib/format";

const sheetClasses: Record<SheetStatus, string> = {
  DRAFT: "border-slate-300 bg-slate-50 text-slate-700",
  SUBMITTED: "border-blue-200 bg-blue-50 text-blue-700",
  RETURNED: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const goalClasses: Record<GoalStatus, string> = {
  NOT_STARTED: "border-slate-300 bg-slate-50 text-slate-700",
  ON_TRACK: "border-blue-200 bg-blue-50 text-blue-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function SheetStatusBadge({ status }: { status: SheetStatus }) {
  return (
    <Badge variant="outline" className={sheetClasses[status]}>
      {sheetStatusLabels[status]}
    </Badge>
  );
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  return (
    <Badge variant="outline" className={goalClasses[status]}>
      {goalStatusLabels[status]}
    </Badge>
  );
}
