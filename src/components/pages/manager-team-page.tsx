"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquarePlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SheetStatusBadge } from "@/components/portal/status-badge";
import { useDemoStore } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";
import { calculateSheetProgress } from "@/lib/scoring";
import type { Quarter } from "@/lib/types";

export function ManagerTeamPage() {
  const { data: session } = useSession();
  const { state, logCheckIn } = useDemoStore();
  const managerId = session?.user.id ?? "";
  const teamMembers = state.users.filter((user) => user.managerId === managerId);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(teamMembers[0]?.id ?? "");
  const [quarter, setQuarter] = useState<Quarter>("Q1");
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const selectedEmployee = teamMembers.find(
    (member) => member.id === selectedEmployeeId,
  );
  const selectedSheet = state.goalSheets.find(
    (sheet) => sheet.employeeId === selectedEmployeeId,
  );
  const selectedCheckIns = state.checkIns.filter(
    (checkIn) => checkIn.employeeId === selectedEmployeeId,
  );

  const saveCheckIn = () => {
    if (!selectedEmployeeId || !comment.trim()) {
      setNotice({
        ok: false,
        message: "Add a check-in comment before saving.",
      });
      return;
    }

    setNotice(logCheckIn(selectedEmployeeId, managerId, quarter, comment));
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Team progress</p>
        <h2 className="text-3xl font-semibold tracking-normal">
          Manager check-ins
        </h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Compare planned targets with actual achievement, then save a
          structured conversation note.
        </p>
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

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Team members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamMembers.map((member) => {
              const sheet = state.goalSheets.find(
                (item) => item.employeeId === member.id,
              );
              const active = selectedEmployeeId === member.id;

              return (
                <button
                  key={member.id}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    active ? "border-primary bg-secondary" : "bg-background hover:border-primary"
                  }`}
                  onClick={() => setSelectedEmployeeId(member.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{member.name}</p>
                    {sheet ? <SheetStatusBadge status={sheet.status} /> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.title} - {sheet ? calculateSheetProgress(sheet) : 0}%
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedEmployee?.name ?? "Select a team member"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedSheet ? (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-secondary text-left">
                      <tr>
                        <th className="px-3 py-2">Goal</th>
                        <th className="px-3 py-2">Target</th>
                        <th className="px-3 py-2">Actual</th>
                        <th className="px-3 py-2">Weight</th>
                        <th className="px-3 py-2">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSheet.goals.map((goal) => (
                        <tr key={goal.id} className="border-t bg-card">
                          <td className="max-w-sm px-3 py-3">
                            <p className="font-medium">{goal.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {goal.description}
                            </p>
                          </td>
                          <td className="px-3 py-3">{goal.target}</td>
                          <td className="px-3 py-3">{goal.actual}</td>
                          <td className="px-3 py-3">{goal.weightage}%</td>
                          <td className="px-3 py-3">
                            {calculateSheetProgress({
                              ...selectedSheet,
                              goals: [goal],
                            })}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  No sheet is available for this employee.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquarePlus className="h-4 w-4 text-primary" />
                Check-in note
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 lg:grid-cols-[160px_1fr_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="quarter">Quarter</Label>
                <select
                  id="quarter"
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm"
                  value={quarter}
                  onChange={(event) => setQuarter(event.target.value as Quarter)}
                >
                  {["Q1", "Q2", "Q3", "Q4"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Capture the discussion and any follow-up."
                />
              </div>
              <Button onClick={saveCheckIn}>Save check-in</Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Past notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="rounded-lg border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium">{checkIn.quarter}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(checkIn.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{checkIn.comment}</p>
                </div>
              ))}
              {selectedCheckIns.length === 0 ? (
                <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  No manager check-in has been logged yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
