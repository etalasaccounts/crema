import { NextResponse } from "next/server";
import { createVideoViewSchema } from "@/lib/validation/video-view";
import { createVideoView } from "@/lib/db/video-views";
import { db } from "@/lib/db";
import { ZodError } from "zod";
import { randomUUID } from "crypto";

/**
 * POST /api/videos/[id]/views
 * Record a new view for a specific video
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: videoId } = await params;

    // Add videoId to the request body
    const requestData = {
      ...body,
      videoId,
    };

    // Generate sessionId for anonymous users if not provided
    if (!requestData.userId && !requestData.sessionId) {
      requestData.sessionId = randomUUID();
    }

    const validatedData = createVideoViewSchema.parse(requestData);
    const videoView = await createVideoView(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: videoView,
        message: "Video view recorded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating video view:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create video view",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/videos/[id]/views
 * Get all viewers and view count for a specific video
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "Video ID is required",
        },
        { status: 400 }
      );
    }

    // Get all video views for this video with user data
    const videoViews = await db.videoView.findMany({
      where: {
        videoId: videoId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        viewedAt: "desc",
      },
    });

    // Transform data for frontend
    const viewers = videoViews.map((view: any) => ({
      id: view.id,
      userId: view.userId,
      sessionId: view.sessionId,
      user: view.user
        ? {
            id: view.user.id,
            name: view.user.name,
            email: view.user.email,
          }
        : null,
      viewedAt: view.viewedAt,
    }));

    const totalViews = videoViews.length;

    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        viewers,
      },
    });
  } catch (error) {
    console.error("Error fetching video viewers:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch video viewers",
      },
      { status: 500 }
    );
  }
}