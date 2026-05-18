"use client";

import { Bell, GitBranch, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";

export function AdminAuditPage() {
  const { state } = useDemoStore();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Governance</p>
        <h2 className="text-3xl font-semibold tracking-normal">
          Audit and escalation
        </h2>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Every important workflow action lands in the audit log with actor,
          entity, and timestamp.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Audit trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-secondary text-left">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Actor</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Entity</th>
                    <th className="px-3 py-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {state.auditLogs.map((entry) => (
                    <tr key={entry.id} className="border-t bg-card">
                      <td className="px-3 py-3 text-muted-foreground">
                        {formatDateTime(entry.createdAt)}
                      </td>
                      <td className="px-3 py-3 font-medium">{entry.actorName}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-secondary px-2 py-1 text-xs text-primary">
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{entry.entity}</td>
                      <td className="px-3 py-3">{entry.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Notification events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.notifications.map((notification) => {
                const recipient = state.users.find(
                  (user) => user.id === notification.recipientId,
                );

                return (
                  <div
                    key={notification.id}
                    className="rounded-lg border bg-background p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-primary">
                        {notification.channel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {notification.status}
                      </span>
                    </div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Recipient: {recipient?.name ?? notification.recipientId}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-lg border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitBranch className="h-4 w-4 text-primary" />
                Escalation rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.escalationRules.map((rule) => (
                <div key={rule.id} className="rounded-lg border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium">{rule.name}</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                      {rule.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Nudge after {rule.firstNudgeDays} days -{" "}
                    {rule.escalationPath.join(" -> ")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
