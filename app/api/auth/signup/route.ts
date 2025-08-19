import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { signUpSchema } from "@/schemas/auth";
import { Prisma } from "@/lib/generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = signUpSchema.parse(body);
    const { name, email, password } = validatedData;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with Personal workspace in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: "", // Default empty phone for now
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      // Create default 'Personal' workspace
      const workspace = await tx.workspace.create({
        data: {
          name: "Personal",
          userId: user.id,
        },
      });

      // Update user to set the Personal workspace as active
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { activeWorkspaceId: workspace.id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          activeWorkspaceId: true,
        },
      });

      return { user: updatedUser, workspace };
    });

    const { user } = result;

    // Map activeWorkspaceId to active_workspace for frontend compatibility
    const { activeWorkspaceId, ...userWithoutWorkspaceId } = user;
    const userResponse = {
      ...userWithoutWorkspaceId,
      active_workspace: activeWorkspaceId || '',
    };

    // Create JWT token for auto-login
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Create response
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: userResponse,
        token,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie for auto-login
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.message },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}