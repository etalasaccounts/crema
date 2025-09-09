// Next
import { NextRequest, NextResponse } from "next/server";

// Prisma
import { db } from "@/lib/db";
import {
  getCommentsForVideo,
  createComment,
  replyToComment,
} from "@/lib/db/comments";

// Validation
import {
  createCommentSchema,
  replyToCommentSchema,
} from "@/lib/validation/comment";
import { z } from "zod";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = createCommentSchema.parse({
      ...body,
      videoId, // Ensure videoId from URL is used
    });

    // Get auth token from cookie
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the comment
    const comment = await createComment({
      ...validatedData,
      userId: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);

    // Handle validation errors
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
        error: "Failed to create comment",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await request.json();

    // Validate the request body
    const validatedData = replyToCommentSchema.parse(body);

    // Get auth token from cookie
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the parent comment exists and belongs to the specified video
    const parentComment = await db.comment.findUnique({
      where: {
        id: validatedData.commentId,
      },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 }
      );
    }

    if (parentComment.videoId !== videoId) {
      return NextResponse.json(
        { error: "Parent comment does not belong to this video" },
        { status: 400 }
      );
    }

    // Create the reply
    const reply = await replyToComment(
      validatedData,
      decoded.userId // Use authenticated user's ID
    );

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Error replying to comment:", error);

    // Handle validation errors
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
        error: "Failed to reply to comment",
      },
      { status: 500 }
    );
  }
}
