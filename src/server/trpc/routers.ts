import { z } from "zod";
import { createDemoState } from "@/lib/demo-data";
import { calculateSheetProgress } from "@/lib/scoring";
import { router, publicProcedure } from "@/server/trpc/trpc";

const state = createDemoState();

export const appRouter = router({
  auth: router({
    demoUsers: publicProcedure.query(() =>
      state.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        department: user.department,
        managerId: user.managerId,
        avatarInitials: user.avatarInitials,
      })),
    ),
  }),
  goalSheet: router({
    list: publicProcedure.query(() => state.goalSheets),
    byEmployee: publicProcedure
      .input(z.object({ employeeId: z.string() }))
      .query(({ input }) =>
        state.goalSheets.find((sheet) => sheet.employeeId === input.employeeId),
      ),
  }),
  manager: router({
    approvalQueue: publicProcedure.query(() =>
      state.goalSheets.filter((sheet) => sheet.status === "SUBMITTED"),
    ),
  }),
  checkIn: router({
    list: publicProcedure.query(() => state.checkIns),
  }),
  admin: router({
    cycleWindows: publicProcedure.query(() => state.cycleWindows),
    auditTrail: publicProcedure.query(() => state.auditLogs),
  }),
  reports: router({
    achievementRows: publicProcedure.query(() =>
      state.goalSheets.flatMap((sheet) =>
        sheet.goals.map((goal) => ({
          employeeId: sheet.employeeId,
          goalTitle: goal.title,
          target: goal.target,
          actual: goal.actual,
          weightage: goal.weightage,
          progress: calculateSheetProgress({ ...sheet, goals: [goal] }),
        })),
      ),
    ),
  }),
  analytics: router({
    summary: publicProcedure.query(() => ({
      employees: state.users.filter((user) => user.role === "EMPLOYEE").length,
      submitted: state.goalSheets.filter((sheet) => sheet.status === "SUBMITTED")
        .length,
      approved: state.goalSheets.filter((sheet) => sheet.status === "APPROVED")
        .length,
    })),
  }),
  notifications: router({
    list: publicProcedure.query(() => state.notifications),
    escalationRules: publicProcedure.query(() => state.escalationRules),
  }),
});

export type AppRouter = typeof appRouter;
