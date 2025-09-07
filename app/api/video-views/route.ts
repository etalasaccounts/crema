import { NextRequest, NextResponse } from "next/server";
import { createVideoViewSchema } from "@/lib/validation/video-view";
import { createVideoView } from "@/lib/db/video-views";
import { ZodError } from "zod";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate sessionId for anonymous users if not provided
    if (!body.userId && !body.sessionId) {
      body.sessionId = randomUUID();
    }

    const validatedData = createVideoViewSchema.parse(body);

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
