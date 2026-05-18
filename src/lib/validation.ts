import { z } from "zod";

export const uomTypeSchema = z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]);

export const goalFormSchema = z
  .object({
    title: z.string().min(3, "Give the goal a clear title."),
    description: z.string().min(10, "Add enough detail for a manager to review."),
    thrustArea: z.string().min(2, "Choose or enter a thrust area."),
    uomType: uomTypeSchema,
    target: z.coerce.number().min(0, "Target cannot be negative."),
    actual: z.coerce.number().min(0, "Actual achievement cannot be negative."),
    weightage: z.coerce
      .number()
      .min(10, "Each goal must carry at least 10% weightage.")
      .max(100, "Weightage cannot exceed 100%."),
  })
  .superRefine((goal, ctx) => {
    if (goal.uomType !== "ZERO" && goal.target <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["target"],
        message: "Target must be greater than zero.",
      });
    }
  });

export const goalSubmitSchema = z
  .array(goalFormSchema)
  .min(1, "Add at least one goal before submitting.")
  .max(8, "A goal sheet can contain a maximum of 8 goals.")
  .superRefine((goals, ctx) => {
    const total = goals.reduce((sum, goal) => sum + goal.weightage, 0);

    if (total !== 100) {
      ctx.addIssue({
        code: "custom",
        message: `Total weightage must be exactly 100%. It is currently ${total}%.`,
      });
    }
  });

export type GoalFormValues = z.infer<typeof goalFormSchema>;
export type GoalFormInput = z.input<typeof goalFormSchema>;

export function validateGoalsForSubmission(goals: GoalFormValues[]) {
  const result = goalSubmitSchema.safeParse(goals);

  if (result.success) {
    return { ok: true, errors: [] as string[] };
  }

  return {
    ok: false,
    errors: result.error.issues.map((issue) => issue.message),
  };
}

export function totalWeightage(goals: { weightage: number }[]) {
  return goals.reduce((sum, goal) => sum + goal.weightage, 0);
}
