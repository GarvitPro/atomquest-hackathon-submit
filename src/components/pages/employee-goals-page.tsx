"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Edit3, Plus, Send, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GoalStatusBadge, SheetStatusBadge } from "@/components/portal/status-badge";
import { useDemoStore } from "@/lib/demo-store";
import { uomLabels } from "@/lib/format";
import { calculateGoalProgress } from "@/lib/scoring";
import type { Goal, UoMType } from "@/lib/types";
import {
  goalFormSchema,
  type GoalFormInput,
  type GoalFormValues,
  totalWeightage,
  validateGoalsForSubmission,
} from "@/lib/validation";

const thrustAreas = [
  "Revenue Growth",
  "Operational Excellence",
  "Customer Experience",
  "Quality",
  "Capability Building",
  "Safety",
];

const emptyValues: GoalFormValues = {
  title: "",
  description: "",
  thrustArea: "Revenue Growth",
  uomType: "MIN",
  target: 100,
  actual: 0,
  weightage: 10,
};

export function EmployeeGoalsPage() {
  const { data: session } = useSession();
  const {
    state,
    upsertGoal,
    removeGoal,
    submitGoalSheet,
    resetDemo,
  } = useDemoStore();
  const [editingGoalId, setEditingGoalId] = useState<string | undefined>();
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const employeeId = session?.user.id ?? "";
  const sheet = state.goalSheets.find((item) => item.employeeId === employeeId);
  const weightage = totalWeightage(sheet?.goals ?? []);
  const validation = validateGoalsForSubmission(sheet?.goals ?? []);
  const canEdit = !!sheet && !sheet.locked && sheet.status !== "SUBMITTED";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalFormInput, unknown, GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: emptyValues,
  });

  const sortedGoals = useMemo(
    () => [...(sheet?.goals ?? [])].sort((a, b) => b.weightage - a.weightage),
    [sheet?.goals],
  );

  const onSubmit = (values: GoalFormValues) => {
    if (!session?.user.id) {
      return;
    }

    const result = upsertGoal(employeeId, session.user.id, {
      ...values,
      id: editingGoalId,
      status: "NOT_STARTED",
    });
    setNotice(result);

    if (result.ok) {
      setEditingGoalId(undefined);
      reset(emptyValues);
    }
  };

  const editGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    reset({
      title: goal.title,
      description: goal.description,
      thrustArea: goal.thrustArea,
      uomType: goal.uomType,
      target: goal.target,
      actual: goal.actual,
      weightage: goal.weightage,
    });
  };

  const submitSheet = () => {
    if (!session?.user.id) {
      return;
    }

    setNotice(submitGoalSheet(employeeId, session.user.id));
  };

  if (!sheet) {
    return (
      <Alert>
        <AlertTitle>Goal sheet unavailable</AlertTitle>
        <AlertDescription>
          Reset the demo data if the local workspace was edited unexpectedly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">FY 2026-27</p>
          <h2 className="text-3xl font-semibold tracking-normal">My goal sheet</h2>
          <p className="mt-1 max-w-3xl text-muted-foreground">
            Shape the sheet before submitting it. Once the manager approves it,
            goals lock for the cycle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SheetStatusBadge status={sheet.status} />
          <Button variant="outline" onClick={resetDemo}>
            Reset demo
          </Button>
          <Button disabled={!validation.ok || sheet.locked} onClick={submitSheet}>
            <Send className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      {notice ? (
        <Alert
          className={
            notice.ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }
        >
          <AlertTitle>{notice.ok ? "Saved" : "Needs attention"}</AlertTitle>
          <AlertDescription>{notice.message}</AlertDescription>
        </Alert>
      ) : null}

      {sheet.returnedComment ? (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTitle>Manager note</AlertTitle>
          <AlertDescription>{sheet.returnedComment}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" />
              {editingGoalId ? "Edit goal" : "Add goal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="title">Goal title</Label>
                <Input id="title" disabled={!canEdit} {...register("title")} />
                {errors.title ? (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  disabled={!canEdit}
                  rows={4}
                  {...register("description")}
                />
                {errors.description ? (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="thrustArea">Thrust area</Label>
                  <select
                    id="thrustArea"
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
                    disabled={!canEdit}
                    {...register("thrustArea")}
                  >
                    {thrustAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uomType">UoM</Label>
                  <select
                    id="uomType"
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
                    disabled={!canEdit}
                    {...register("uomType")}
                  >
                    {Object.entries(uomLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    disabled={!canEdit}
                    type="number"
                    {...register("target")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actual">Actual</Label>
                  <Input
                    id="actual"
                    disabled={!canEdit}
                    type="number"
                    {...register("actual")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weightage">Weightage</Label>
                  <Input
                    id="weightage"
                    disabled={!canEdit}
                    type="number"
                    {...register("weightage")}
                  />
                </div>
              </div>
              <Button className="w-full" disabled={!canEdit} type="submit">
                {editingGoalId ? "Update goal" : "Add goal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">Goals</CardTitle>
              <div className="text-sm">
                <span className={weightage === 100 ? "text-success" : "text-warning"}>
                  {weightage}%
                </span>{" "}
                total weightage
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!validation.ok ? (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertTitle>Submission checks</AlertTitle>
                <AlertDescription>{validation.errors.join(" ")}</AlertDescription>
              </Alert>
            ) : null}

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[780px] text-sm">
                <thead className="bg-secondary text-left text-secondary-foreground">
                  <tr>
                    <th className="px-3 py-2">Goal</th>
                    <th className="px-3 py-2">UoM</th>
                    <th className="px-3 py-2">Target</th>
                    <th className="px-3 py-2">Actual</th>
                    <th className="px-3 py-2">Weight</th>
                    <th className="px-3 py-2">Progress</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGoals.map((goal) => (
                    <tr key={goal.id} className="border-t bg-card">
                      <td className="max-w-xs px-3 py-3">
                        <p className="font-medium">{goal.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {goal.description}
                        </p>
                      </td>
                      <td className="px-3 py-3">{uomLabels[goal.uomType as UoMType]}</td>
                      <td className="px-3 py-3">{goal.target}</td>
                      <td className="px-3 py-3">{goal.actual}</td>
                      <td className="px-3 py-3">{goal.weightage}%</td>
                      <td className="px-3 py-3">{calculateGoalProgress(goal)}%</td>
                      <td className="px-3 py-3">
                        <GoalStatusBadge status={goal.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            aria-label={`Edit ${goal.title}`}
                            disabled={!canEdit}
                            size="icon-sm"
                            variant="outline"
                            onClick={() => editGoal(goal)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            aria-label={`Remove ${goal.title}`}
                            disabled={!canEdit}
                            size="icon-sm"
                            variant="outline"
                            onClick={() => {
                              if (session?.user.id) {
                                setNotice(
                                  removeGoal(employeeId, session.user.id, goal.id),
                                );
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sortedGoals.length === 0 ? (
                    <tr>
                      <td className="px-3 py-8 text-center text-muted-foreground" colSpan={8}>
                        Add the first goal to start the sheet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
