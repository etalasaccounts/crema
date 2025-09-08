import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Video ID is required" 
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
        viewedAt: 'desc',
      },
    });

    // Transform data for frontend
    const viewers = videoViews.map((view: any) => ({
      id: view.id,
      userId: view.userId,
      sessionId: view.sessionId,
      user: view.user ? {
        id: view.user.id,
        name: view.user.name,
        email: view.user.email,
      } : null,
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
        error: "Failed to fetch video viewers" 
      },
      { status: 500 }
    );
  }
}