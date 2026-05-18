"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalStatusBadge, SheetStatusBadge } from "@/components/portal/status-badge";
import { useDemoStore } from "@/lib/demo-store";
import { formatDateTime, goalStatusLabels, uomLabels } from "@/lib/format";
import { calculateGoalProgress, calculateSheetProgress } from "@/lib/scoring";
import type { GoalStatus } from "@/lib/types";

export function EmployeeCheckInsPage() {
  const { data: session } = useSession();
  const { state, updateAchievement } = useDemoStore();
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const employeeId = session?.user.id ?? "";
  const sheet = state.goalSheets.find((item) => item.employeeId === employeeId);
  const employeeCheckIns = state.checkIns.filter(
    (checkIn) => checkIn.employeeId === employeeId,
  );

  if (!sheet) {
    return (
      <Alert>
        <AlertTitle>No goal sheet found</AlertTitle>
        <AlertDescription>
          The current demo state does not include a sheet for this user.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Quarterly updates</p>
          <h2 className="text-3xl font-semibold tracking-normal">
            Achievement tracking
          </h2>
          <p className="mt-1 max-w-3xl text-muted-foreground">
            Keep actual achievement current before each check-in window.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SheetStatusBadge status={sheet.status} />
          <span className="rounded-lg border bg-card px-3 py-2 text-sm font-medium">
            {calculateSheetProgress(sheet)}% weighted progress
          </span>
        </div>
      </div>

      {notice ? (
        <Alert
          className={
            notice.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }
        >
          <AlertTitle>{notice.ok ? "Updated" : "Not saved"}</AlertTitle>
          <AlertDescription>{notice.message}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Current goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sheet.goals.map((goal) => (
            <div key={goal.id} className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{goal.title}</h3>
                    <GoalStatusBadge status={goal.status} />
                  </div>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    {goal.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-card px-2 py-1">
                      {uomLabels[goal.uomType]}
                    </span>
                    <span className="rounded-full bg-card px-2 py-1">
                      Target {goal.target}
                    </span>
                    <span className="rounded-full bg-card px-2 py-1">
                      Weight {goal.weightage}%
                    </span>
                    <span className="rounded-full bg-card px-2 py-1">
                      Progress {calculateGoalProgress(goal)}%
                    </span>
                  </div>
                </div>

                <AchievementEditor
                  actual={goal.actual}
                  status={goal.status}
                  onSave={(actual, status) => {
                    if (session?.user.id) {
                      setNotice(
                        updateAchievement(
                          employeeId,
                          session.user.id,
                          goal.id,
                          actual,
                          status,
                        ),
                      );
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Manager check-in log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {employeeCheckIns.map((checkIn) => (
            <div key={checkIn.id} className="rounded-lg border bg-background p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{checkIn.quarter} check-in</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(checkIn.createdAt)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{checkIn.comment}</p>
            </div>
          ))}
          {employeeCheckIns.length === 0 ? (
            <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              Manager comments will appear here after the first check-in.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function AchievementEditor({
  actual,
  status,
  onSave,
}: {
  actual: number;
  status: GoalStatus;
  onSave: (actual: number, status: GoalStatus) => void;
}) {
  const [nextActual, setNextActual] = useState(actual);
  const [nextStatus, setNextStatus] = useState<GoalStatus>(status);

  return (
    <div className="grid w-full gap-3 rounded-lg border bg-card p-3 sm:w-80">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Actual</Label>
          <Input
            type="number"
            value={nextActual}
            onChange={(event) => setNextActual(Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value as GoalStatus)}
          >
            {Object.entries(goalStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button onClick={() => onSave(nextActual, nextStatus)}>
        <Save className="mr-2 h-4 w-4" />
        Save update
      </Button>
    </div>
  );
}
