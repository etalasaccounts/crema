import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    if (!user || !user.activeWorkspaceId) {
      return NextResponse.json(
        { error: "User not authenticated or no active workspace" },
        { status: 401 }
      );
    }

    // Get workspace with video count
    const workspace = await db.workspace.findUnique({
      where: { id: user.activeWorkspaceId },
      select: {
        id: true,
        name: true,
        isPremium: true,
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const workspaceData = {
      id: workspace.id,
      name: workspace.name,
      isPremium: workspace.isPremium,
      videoCount: workspace._count.videos,
    };

    return NextResponse.json({
      success: true,
      workspace: workspaceData,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}