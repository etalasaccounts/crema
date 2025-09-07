import { z } from "zod";

export const createVideoViewSchema = z
  .object({
    videoId: z.string().min(1, "Video ID is required"),
    userId: z.string().optional(), // Optional for anonymous users
    sessionId: z.string().optional(), // Optional - only for anonymous users
  })
  .refine((data) => data.userId || data.sessionId, {
    message: "Either userId or sessionId must be provided",
    path: ["userId", "sessionId"],
  });

export type VideoView = z.infer<typeof createVideoViewSchema>;
