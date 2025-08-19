import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate that ID is provided
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Video ID is required",
        },
        { status: 400 }
      );
    }

    // Check if video exists and increment views
    const video = await db.video.update({
      where: {
        id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return NextResponse.json({
      success: true,
      views: video.views,
    });
  } catch (error) {
    console.error("Error incrementing video views:", error);

    // Check if it's a record not found error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Video not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to increment video views",
      },
      { status: 500 }
    );
  }
}
