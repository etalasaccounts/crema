import { db } from "@/lib/db";
import {
  CreateCommentSchema,
  ReplyToCommentSchema,
} from "@/lib/validation/comment";

export async function getCommentsForVideo(videoId: string) {
  return db.comment.findMany({
    where: {
      videoId,
      parentId: null, // Only top-level comments
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc", // Replies ordered oldest first
        },
      },
    },
  });
}

export async function createComment(
  data: CreateCommentSchema & { userId: string }
) {
  return db.comment.create({
    data: {
      content: data.content,
      videoId: data.videoId,
      userId: data.userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function replyToComment(
  data: ReplyToCommentSchema,
  userId: string
) {
  // Ambil parent comment untuk mendapatkan videoId
  const parentComment = await db.comment.findUnique({
    where: { id: data.commentId },
    select: { videoId: true },
  });

  if (!parentComment) {
    throw new Error("Parent comment not found");
  }

  return db.comment.create({
    data: {
      content: data.content,
      parentId: data.commentId,
      userId,
      videoId: parentComment.videoId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });
}
