import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Verifies JWT token and returns decoded payload
 * @param request NextRequest object
 * @returns Decoded JWT payload or null if invalid
 */
export async function verifyAuthToken(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return null;
    }

    const decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * Middleware utility to check if user is authenticated
 * @param request NextRequest object
 * @returns User ID if authenticated, null otherwise
 */
export async function isAuthenticated(request: NextRequest): Promise<string | null> {
  const payload = await verifyAuthToken(request);
  return payload ? payload.userId : null;
}

/**
 * Middleware utility to require authentication
 * @param request NextRequest object
 * @returns JWTPayload if authenticated, throws error otherwise
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  const payload = await verifyAuthToken(request);
  
  if (!payload) {
    throw new Error("Unauthorized");
  }
  
  return payload;
}