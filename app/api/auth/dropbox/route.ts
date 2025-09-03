import { NextRequest, NextResponse } from "next/server";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const BASE_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DROPBOX_REDIRECT_URI = `${BASE_APP_URL}/api/auth/dropbox/callback`;

export async function GET(request: NextRequest) {
  try {
    if (!DROPBOX_CLIENT_ID) {
      return NextResponse.json(
        { error: "Dropbox OAuth is not configured" },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Create the authorization URL
    const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
    authUrl.searchParams.set("client_id", DROPBOX_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", DROPBOX_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("token_access_type", "offline");
    authUrl.searchParams.set("force_reapprove", "true");
    authUrl.searchParams.set("scope", "account_info.read files.metadata.read files.content.read files.content.write sharing.write");

    console.log("Dropbox auth URL:", authUrl.toString());

    // Store state in HTTP-only cookie for verification
    const response = NextResponse.redirect(authUrl.toString());

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
    console.error("Dropbox OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Dropbox OAuth" },
      { status: 500 }
    );
  }
}