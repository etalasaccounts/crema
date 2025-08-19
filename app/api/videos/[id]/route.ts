import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
            name: true,
          },
        },
      },
    });

    // Check if video exists
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
