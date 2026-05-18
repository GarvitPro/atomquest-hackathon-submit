"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, RotateCcw, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoalStatusBadge, SheetStatusBadge } from "@/components/portal/status-badge";
import { useDemoStore } from "@/lib/demo-store";
import { formatDate, uomLabels } from "@/lib/format";
import { calculateGoalProgress, calculateSheetProgress } from "@/lib/scoring";
import type { Goal } from "@/lib/types";
import { totalWeightage, validateGoalsForSubmission } from "@/lib/validation";

export function ManagerApprovalsPage() {
  const { data: session } = useSession();
  const {
    state,
    approveGoalSheet,
    returnGoalSheet,
    upsertGoal,
  } = useDemoStore();
  const managerId = session?.user.id ?? "";
  const teamMembers = state.users.filter((user) => user.managerId === managerId);
  const teamSheets = state.goalSheets.filter((sheet) =>
    teamMembers.some((member) => member.id === sheet.employeeId),
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    teamSheets.find((sheet) => sheet.status === "SUBMITTED")?.employeeId ??
      teamSheets[0]?.employeeId ??
      "",
  );
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const selectedSheet = teamSheets.find(
    (sheet) => sheet.employeeId === selectedEmployeeId,
  );
  const selectedEmployee = teamMembers.find(
    (member) => member.id === selectedEmployeeId,
  );
  const validation = validateGoalsForSubmission(selectedSheet?.goals ?? []);
  const queue = useMemo(
    () => teamSheets.filter((sheet) => sheet.status === "SUBMITTED"),
    [teamSheets],
  );

  const approve = () => {
    if (!selectedSheet || !validation.ok) {
      setNotice({
        ok: false,
        message: validation.errors.join(" ") || "This sheet is not ready.",
      });
      return;
    }

    setNotice(approveGoalSheet(selectedSheet.employeeId, managerId));
  };

  const returnForRework = () => {
    if (!selectedSheet) {
      return;
    }

    setNotice(returnGoalSheet(selectedSheet.employeeId, managerId, comment));
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">L1 review</p>
          <h2 className="text-3xl font-semibold tracking-normal">
            Approval queue
          </h2>
          <p className="mt-1 max-w-3xl text-muted-foreground">
            Review submitted sheets, tune targets if needed, then approve or
            return with a clear note.
          </p>
        </div>
        <span className="rounded-lg border bg-card px-3 py-2 text-sm font-medium">
          {queue.length} waiting
        </span>
      </div>

      {notice ? (
        <Alert
          className={
            notice.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }
        >
          <AlertTitle>{notice.ok ? "Done" : "Needs attention"}</AlertTitle>
          <AlertDescription>{notice.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Team sheets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamSheets.map((sheet) => {
              const employee = teamMembers.find(
                (member) => member.id === sheet.employeeId,
              );
              const active = selectedEmployeeId === sheet.employeeId;

              return (
                <button
                  key={sheet.id}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    active ? "border-primary bg-secondary" : "bg-background hover:border-primary"
                  }`}
                  onClick={() => setSelectedEmployeeId(sheet.employeeId)}
                  type="button"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium">{employee?.name}</p>
                    <SheetStatusBadge status={sheet.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {calculateSheetProgress(sheet)}% progress - submitted{" "}
                    {formatDate(sheet.submittedAt)}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedEmployee?.name ?? "Select an employee"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedEmployee?.title} - {selectedEmployee?.department}
                </p>
              </div>
              {selectedSheet ? (
                <div className="flex flex-wrap gap-2">
                  <SheetStatusBadge status={selectedSheet.status} />
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm text-primary">
                    {totalWeightage(selectedSheet.goals)}% weight
                  </span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSheet ? (
              <>
                {!validation.ok ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTitle>Approval checks</AlertTitle>
                    <AlertDescription>
                      {validation.errors.join(" ")}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead className="bg-secondary text-left">
                      <tr>
                        <th className="px-3 py-2">Goal</th>
                        <th className="px-3 py-2">UoM</th>
                        <th className="px-3 py-2">Target</th>
                        <th className="px-3 py-2">Weight</th>
                        <th className="px-3 py-2">Actual</th>
                        <th className="px-3 py-2">Progress</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2 text-right">Save</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSheet.goals.map((goal) => (
                        <ManagerGoalRow
                          key={goal.id}
                          disabled={selectedSheet.locked}
                          goal={goal}
                          onSave={(nextGoal) => {
                            setNotice(
                              upsertGoal(
                                selectedSheet.employeeId,
                                managerId,
                                nextGoal,
                              ),
                            );
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="return-note">Return note</Label>
                    <Textarea
                      id="return-note"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Keep the note crisp and specific."
                    />
                  </div>
                  <Button
                    disabled={selectedSheet.locked}
                    variant="outline"
                    onClick={returnForRework}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Return
                  </Button>
                  <Button disabled={!validation.ok || selectedSheet.locked} onClick={approve}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </>
            ) : (
              <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                Select a sheet from the queue.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManagerGoalRow({
  goal,
  disabled,
  onSave,
}: {
  goal: Goal;
  disabled: boolean;
  onSave: (goal: Goal) => void;
}) {
  const [target, setTarget] = useState(goal.target);
  const [weightage, setWeightage] = useState(goal.weightage);

  return (
    <tr className="border-t bg-card">
      <td className="max-w-xs px-3 py-3">
        <p className="font-medium">{goal.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {goal.description}
        </p>
      </td>
      <td className="px-3 py-3">{uomLabels[goal.uomType]}</td>
      <td className="px-3 py-3">
        <Input
          className="w-24"
          disabled={disabled}
          type="number"
          value={target}
          onChange={(event) => setTarget(Number(event.target.value))}
        />
      </td>
      <td className="px-3 py-3">
        <Input
          className="w-24"
          disabled={disabled}
          type="number"
          value={weightage}
          onChange={(event) => setWeightage(Number(event.target.value))}
        />
      </td>
      <td className="px-3 py-3">{goal.actual}</td>
      <td className="px-3 py-3">{calculateGoalProgress(goal)}%</td>
      <td className="px-3 py-3">
        <GoalStatusBadge status={goal.status} />
      </td>
      <td className="px-3 py-3 text-right">
        <Button
          aria-label={`Save ${goal.title}`}
          disabled={disabled}
          size="icon-sm"
          variant="outline"
          onClick={() =>
            onSave({
              ...goal,
              target,
              weightage,
            })
          }
        >
          <Save className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
