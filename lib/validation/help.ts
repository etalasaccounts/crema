import { z } from "zod";

export const helpFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority level",
  }),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export type HelpFormData = z.infer<typeof helpFormSchema>; 