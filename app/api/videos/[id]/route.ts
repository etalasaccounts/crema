import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch the video from the database
    const video = await db.video.findUnique({
      where: {
        id,
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
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          error: "Video not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error("Error fetching video:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch video",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get current user for authorization
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Check if video exists and belongs to user's workspace
    const video = await db.video.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
      },
    });

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          error: "Video not found",
        },
        { status: 404 }
      );
    }

    // Check if user has permission to delete (either owner or same workspace)
    if (video.userId !== user.id && video.workspaceId !== user.activeWorkspaceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You don't have permission to delete this video",
        },
        { status: 403 }
      );
    }

    // Delete the video from database
    await db.video.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete video",
      },
      { status: 500 }
    );
  }
}