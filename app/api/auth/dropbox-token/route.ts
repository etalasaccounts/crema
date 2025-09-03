import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface DropboxTokenRefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string; // Only present in initial token exchange
  uid: string;
  account_id: string;
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

    // Get user with Dropbox tokens
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        dropboxAccessToken: true,
        dropboxRefreshToken: true,
        dropboxTokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.dropboxAccessToken) {
      return NextResponse.json(
        { error: "Dropbox access not authorized. Please authenticate with Dropbox." },
        { status: 403 }
      );
    }

    // Check if token is still valid (with 5 minute buffer)
    const now = new Date();
    const tokenExpiry = user.dropboxTokenExpiry;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (tokenExpiry && now.getTime() < (tokenExpiry.getTime() - bufferTime)) {
      // Token is still valid
      return NextResponse.json({
        accessToken: user.dropboxAccessToken,
        expiresAt: tokenExpiry.toISOString(),
      });
    }

    // Token is expired or about to expire, try to refresh
    if (!user.dropboxRefreshToken) {
      return NextResponse.json(
        { error: "Dropbox access expired. Please re-authenticate with Dropbox." },
        { status: 403 }
      );
    }

    if (!DROPBOX_CLIENT_ID || !DROPBOX_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Dropbox OAuth configuration missing" },
        { status: 500 }
      );
    }

    // Refresh the access token
    const refreshResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: user.dropboxRefreshToken,
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
      }),
    });

    if (!refreshResponse.ok) {
      console.error("Token refresh failed:", await refreshResponse.text());
      return NextResponse.json(
        { error: "Failed to refresh Dropbox access. Please re-authenticate with Dropbox." },
        { status: 403 }
      );
    }

    const refreshData: DropboxTokenRefreshResponse = await refreshResponse.json();
    const newTokenExpiry = new Date(Date.now() + refreshData.expires_in * 1000);

    // Update user with new access token
    await db.user.update({
      where: { id: user.id },
      data: {
        dropboxAccessToken: refreshData.access_token,
        dropboxTokenExpiry: newTokenExpiry,
      },
    });

    return NextResponse.json({
      accessToken: refreshData.access_token,
      expiresAt: newTokenExpiry.toISOString(),
    });

  } catch (error) {
    console.error("Dropbox token API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}