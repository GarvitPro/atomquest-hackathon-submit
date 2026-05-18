"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { KeyRound, SendHorizonal, UsersRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/portal/metric-card";
import { SheetStatusBadge } from "@/components/portal/status-badge";
import { useDemoStore } from "@/lib/demo-store";
import { uomLabels } from "@/lib/format";
import { calculateSheetProgress } from "@/lib/scoring";
import type { UoMType } from "@/lib/types";

export function AdminCyclesPage() {
  const { data: session } = useSession();
  const { state, pushSharedGoal, unlockSheet } = useDemoStore();
  const adminId = session?.user.id ?? "";
  const employees = state.users.filter((user) => user.role === "EMPLOYEE");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([
    "emp-1",
    "emp-2",
  ]);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [sharedGoal, setSharedGoal] = useState({
    title: "Adopt goal portal on time",
    description:
      "Complete goal portal onboarding and keep quarterly updates current.",
    thrustArea: "Operational Excellence",
    uomType: "MIN" as UoMType,
    target: 100,
    actual: 0,
    weightage: 10,
  });
  const [unlockEmployeeId, setUnlockEmployeeId] = useState("emp-3");
  const [unlockReason, setUnlockReason] = useState(
    "Role scope changed after approval.",
  );

  const approved = state.goalSheets.filter(
    (sheet) => sheet.status === "APPROVED",
  ).length;
  const submitted = state.goalSheets.filter(
    (sheet) => sheet.status === "SUBMITTED",
  ).length;
  const completionRate = Math.round((approved / state.goalSheets.length) * 100);
  const averageProgress = useMemo(
    () =>
      Math.round(
        state.goalSheets.reduce(
          (sum, sheet) => sum + calculateSheetProgress(sheet),
          0,
        ) / state.goalSheets.length,
      ),
    [state.goalSheets],
  );

  const pushGoal = () => {
    setNotice(
      pushSharedGoal(adminId, selectedEmployees, {
        ...sharedGoal,
        status: "NOT_STARTED",
      }),
    );
  };

  const unlock = () => {
    setNotice(unlockSheet(unlockEmployeeId, adminId, unlockReason));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Admin / HR</p>
        <h2 className="text-3xl font-semibold tracking-normal">
          Cycle management
        </h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Keep the cycle moving, handle exceptions, and push department goals
          when alignment matters.
        </p>
      </div>

      {notice ? (
        <Alert
          className={
            notice.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }
        >
          <AlertTitle>{notice.ok ? "Updated" : "Needs attention"}</AlertTitle>
          <AlertDescription>{notice.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={UsersRound}
          label="Cycle completion"
          value={`${completionRate}%`}
          detail={`${approved} approved sheets`}
          tone="success"
        />
        <MetricCard
          icon={SendHorizonal}
          label="Manager queue"
          value={submitted}
          detail="Pending approval"
          tone="warning"
        />
        <MetricCard
          icon={KeyRound}
          label="Average progress"
          value={`${averageProgress}%`}
          detail="Across seeded employees"
          tone="info"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cycle windows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-secondary text-left">
                  <tr>
                    <th className="px-3 py-2">Period</th>
                    <th className="px-3 py-2">Window opens</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.cycleWindows.map((window) => (
                    <tr key={window.period} className="border-t bg-card">
                      <td className="px-3 py-3 font-medium">{window.period}</td>
                      <td className="px-3 py-3">{window.opens}</td>
                      <td className="px-3 py-3">{window.action}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-primary">
                          {window.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Exception unlock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="unlock-user">Employee</Label>
              <select
                id="unlock-user"
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
                value={unlockEmployeeId}
                onChange={(event) => setUnlockEmployeeId(event.target.value)}
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unlock-reason">Reason</Label>
              <Textarea
                id="unlock-reason"
                value={unlockReason}
                onChange={(event) => setUnlockReason(event.target.value)}
              />
            </div>
            <Button className="w-full" onClick={unlock}>
              Unlock sheet
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Shared goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="shared-title">Title</Label>
              <Input
                id="shared-title"
                value={sharedGoal.title}
                onChange={(event) =>
                  setSharedGoal({ ...sharedGoal, title: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shared-description">Description</Label>
              <Textarea
                id="shared-description"
                value={sharedGoal.description}
                onChange={(event) =>
                  setSharedGoal({
                    ...sharedGoal,
                    description: event.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="shared-uom">UoM</Label>
                <select
                  id="shared-uom"
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
                  value={sharedGoal.uomType}
                  onChange={(event) =>
                    setSharedGoal({
                      ...sharedGoal,
                      uomType: event.target.value as UoMType,
                    })
                  }
                >
                  {Object.entries(uomLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shared-target">Target</Label>
                <Input
                  id="shared-target"
                  type="number"
                  value={sharedGoal.target}
                  onChange={(event) =>
                    setSharedGoal({
                      ...sharedGoal,
                      target: Number(event.target.value),
                    })
                  }
                />
              </div>
            </div>
            <Button className="w-full" onClick={pushGoal}>
              Push to selected employees
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Employee sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {employees.map((employee) => {
              const sheet = state.goalSheets.find(
                (item) => item.employeeId === employee.id,
              );
              const selected = selectedEmployees.includes(employee.id);

              return (
                <label
                  key={employee.id}
                  className="flex cursor-pointer flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <input
                      checked={selected}
                      className="mt-1 h-4 w-4 accent-primary"
                      onChange={(event) => {
                        setSelectedEmployees((current) =>
                          event.target.checked
                            ? [...current, employee.id]
                            : current.filter((id) => id !== employee.id),
                        );
                      }}
                      type="checkbox"
                    />
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {sheet ? <SheetStatusBadge status={sheet.status} /> : null}
                    <span className="rounded-full bg-card px-2 py-1 text-xs text-muted-foreground">
                      {sheet ? calculateSheetProgress(sheet) : 0}%
                    </span>
                  </div>
                </label>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
