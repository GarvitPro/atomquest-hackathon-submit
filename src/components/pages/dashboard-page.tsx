"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/portal/metric-card";
import { SheetStatusBadge } from "@/components/portal/status-badge";
import { useDemoStore } from "@/lib/demo-store";
import { formatDateTime, roleLabels } from "@/lib/format";
import { calculateSheetProgress } from "@/lib/scoring";

export function DashboardPage() {
  const { data: session } = useSession();
  const { state } = useDemoStore();
  const [mounted, setMounted] = useState(false);
  const role = session?.user.role ?? "EMPLOYEE";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const employees = useMemo(
    () => state.users.filter((user) => user.role === "EMPLOYEE"),
    [state.users],
  );

  const mySheet = state.goalSheets.find(
    (sheet) => sheet.employeeId === session?.user.id,
  );

  const submittedCount = state.goalSheets.filter(
    (sheet) => sheet.status === "SUBMITTED",
  ).length;
  const approvedCount = state.goalSheets.filter(
    (sheet) => sheet.status === "APPROVED",
  ).length;
  const completionRate = Math.round((approvedCount / state.goalSheets.length) * 100);
  const averageProgress = Math.round(
    state.goalSheets.reduce(
      (sum, sheet) => sum + calculateSheetProgress(sheet),
      0,
    ) / state.goalSheets.length,
  );

  const trendData = [
    { quarter: "Q1", progress: 62, completion: 44 },
    { quarter: "Q2", progress: 74, completion: 58 },
    { quarter: "Q3", progress: 81, completion: 73 },
    { quarter: "Q4", progress: averageProgress, completion: completionRate },
  ];

  const departmentData = employees.map((employee) => {
    const sheet = state.goalSheets.find((item) => item.employeeId === employee.id);
    return {
      name: employee.name.split(" ")[0],
      progress: sheet ? calculateSheetProgress(sheet) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-primary">{roleLabels[role]}</p>
        <h2 className="text-3xl font-semibold tracking-normal">
          Welcome back, {session?.user.name?.split(" ")[0]}
        </h2>
        <p className="max-w-3xl text-muted-foreground">
          The current cycle is open for goal setting. The workspace is seeded
          for a complete Employee, Manager, and Admin demo journey.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Target}
          label={role === "EMPLOYEE" ? "My weighted progress" : "Team progress"}
          value={`${role === "EMPLOYEE" && mySheet ? calculateSheetProgress(mySheet) : averageProgress}%`}
          detail="Formula-driven tracking score"
          tone="info"
        />
        <MetricCard
          icon={FileCheck2}
          label="Submitted sheets"
          value={submittedCount}
          detail="Waiting for L1 review"
          tone="warning"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Approved sheets"
          value={approvedCount}
          detail={`${completionRate}% cycle completion`}
          tone="success"
        />
        <MetricCard
          icon={Bell}
          label="Mock notifications"
          value={state.notifications.length}
          detail="Email and Teams events"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-lg border bg-card shadow-sm" id="analytics">
          <CardHeader>
            <CardTitle className="text-base">Quarterly momentum</CardTitle>
          </CardHeader>
          <CardContent className="h-72 min-w-0">
            {mounted ? (
              <ResponsiveContainer
                width="100%"
                height={260}
                minWidth={320}
                minHeight={240}
              >
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="progress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7dee8" />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    dataKey="progress"
                    fill="url(#progress)"
                    name="Progress"
                    stroke="#0f766e"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="completion"
                    fill="#eff6ff"
                    name="Completion"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cycle windows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.cycleWindows.map((window) => (
              <div
                key={window.period}
                className="rounded-lg border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{window.period}</p>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs text-primary">
                    {window.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Opens {window.opens} - {window.action}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">People snapshot</CardTitle>
          </CardHeader>
          <CardContent className="h-72 min-w-0">
            {mounted ? (
              <ResponsiveContainer
                width="100%"
                height={260}
                minWidth={320}
                minHeight={240}
              >
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7dee8" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#14532d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Live demo activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.goalSheets.map((sheet) => {
              const employee = state.users.find(
                (user) => user.id === sheet.employeeId,
              );
              return (
                <div
                  key={sheet.id}
                  className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{employee?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee?.department} - {calculateSheetProgress(sheet)}%
                      weighted progress
                    </p>
                  </div>
                  <SheetStatusBadge status={sheet.status} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock3 className="h-4 w-4 text-primary" />
            Notification timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.notifications.slice(0, 6).map((notification) => (
            <div key={notification.id} className="rounded-lg border bg-background p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-primary">
                  {notification.channel}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(notification.createdAt)}
                </span>
              </div>
              <p className="font-medium">{notification.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {notification.message}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
