import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = `${
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: "Google OAuth is not configured" },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in HTTP-only cookie for verification
    const response = NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        access_type: "offline",
        prompt: "consent",
      })}`
    );

    // Set state cookie for CSRF protection
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google OAuth" },
      { status: 500 }
    );
  }
}
