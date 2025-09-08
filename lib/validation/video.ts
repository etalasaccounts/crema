import { z } from "zod";

export const updateVideoTitleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
});

export type UpdateVideoTitleSchema = z.infer<typeof updateVideoTitleSchema>;
