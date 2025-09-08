import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(1000, "Comment too long"),
  videoId: z.string().min(1, "Video ID is required"),
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;

export const replyToCommentSchema = z.object({
  content: z.string().min(1, "Reply content is required").max(1000, "Reply too long"),
  commentId: z.string().min(1, "Comment ID is required"),
});

export type ReplyToCommentSchema = z.infer<typeof replyToCommentSchema>;