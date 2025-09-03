import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface GoogleTokenRefreshResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface JWTPayload {
  userId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const authToken = request.cookies.get("auth-token")?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Get user with Google tokens
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.googleAccessToken) {
      return NextResponse.json(
        { error: "Google Drive access not authorized. Please re-authenticate with Google." },
        { status: 403 }
      );
    }

    // Check if token is still valid (with 5 minute buffer)
    const now = new Date();
    const tokenExpiry = user.googleTokenExpiry;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (tokenExpiry && now.getTime() < (tokenExpiry.getTime() - bufferTime)) {
      // Token is still valid
      return NextResponse.json({
        accessToken: user.googleAccessToken,
        expiresAt: tokenExpiry.toISOString(),
      });
    }

    // Token is expired or about to expire, try to refresh
    if (!user.googleRefreshToken) {
      return NextResponse.json(
        { error: "Google Drive access expired. Please re-authenticate with Google." },
        { status: 403 }
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Google OAuth configuration missing" },
        { status: 500 }
      );
    }

    // Refresh the access token
    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: user.googleRefreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!refreshResponse.ok) {
      console.error("Token refresh failed:", await refreshResponse.text());
      return NextResponse.json(
        { error: "Failed to refresh Google Drive access. Please re-authenticate with Google." },
        { status: 403 }
      );
    }

    const refreshData: GoogleTokenRefreshResponse = await refreshResponse.json();
    const newTokenExpiry = new Date(Date.now() + refreshData.expires_in * 1000);

    // Update user with new access token
    await db.user.update({
      where: { id: user.id },
      data: {
        googleAccessToken: refreshData.access_token,
        googleTokenExpiry: newTokenExpiry,
      },
    });

    return NextResponse.json({
      accessToken: refreshData.access_token,
      expiresAt: newTokenExpiry.toISOString(),
    });

  } catch (error) {
    console.error("Google Drive token API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}