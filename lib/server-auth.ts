import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

interface ServerUser {
  id: string;
  name: string | null;
  email: string;
  activeWorkspaceId: string | null;
}

/**
 * Get current user from JWT token in server components
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Verify and decode JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError) {
      console.error("Invalid JWT token:", jwtError);
      return null;
    }

    // Fetch current user data from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        activeWorkspaceId: true,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get current user's active workspace ID
 * Returns null if user is not authenticated or has no active workspace
 */
export async function getCurrentUserWorkspaceId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.activeWorkspaceId || null;
}