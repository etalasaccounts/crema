import { db } from "@/lib/db";
import { VideoView } from "@/lib/validation/video-view";
import { Prisma } from "@/lib/generated/prisma";

export async function createVideoView(data: VideoView) {
  try {
    // Check if view already exists
    const existingView = await db.videoView.findFirst({
      where: {
        videoId: data.videoId,
        OR: [
          // For logged in users, check by userId
          data.userId ? { userId: data.userId } : {},
          // For anonymous users, check by sessionId
          data.sessionId ? { sessionId: data.sessionId } : {},
        ].filter((condition) => Object.keys(condition).length > 0),
      },
    });

    if (existingView) {
      // Return existing view instead of creating duplicate
      return existingView;
    }

    // Create new view if none exists
    return await db.videoView.create({
      data,
    });
  } catch (error) {
    // Handle unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Find and return the existing view
      const existingView = await db.videoView.findFirst({
        where: {
          videoId: data.videoId,
          OR: [
            data.userId ? { userId: data.userId } : {},
            data.sessionId ? { sessionId: data.sessionId } : {},
          ].filter((condition) => Object.keys(condition).length > 0),
        },
      });
      return existingView;
    }
    throw error;
  }
}

export async function getVideoViewCount(videoId: string) {
  return db.videoView.count({
    where: {
      videoId,
    },
  });
}
