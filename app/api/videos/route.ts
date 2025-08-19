import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVideoTitleWithTimestamp } from "@/lib/video-utils";
import { z } from "zod";

// Schema for creating a video
const createVideoSchema = z.object({
  videoUrl: z.string().url("Invalid video URL"),
  userId: z.string().uuid("Invalid user ID"),
  workspaceId: z.string().uuid("Invalid workspace ID"),
  title: z.string().optional(),
  duration: z.number().positive("Duration must be positive").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received video creation request body:", body);

    // Validate the request body
    const validatedData = createVideoSchema.parse(body);
    console.log("Validated data:", validatedData);
    console.log("Duration value:", validatedData.duration);

    // Generate title if not provided
    const title = validatedData.title || generateVideoTitleWithTimestamp();

    // Create the video record in the database
    const video = await db.video.create({
      data: {
        title,
        videoUrl: validatedData.videoUrl,
        userId: validatedData.userId,
        workspaceId: validatedData.workspaceId,
        duration: validatedData.duration,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error("Error creating video:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create video record",
      },
      { status: 500 }
    );
  }
}
