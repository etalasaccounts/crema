import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const BASE_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DROPBOX_REDIRECT_URI = `${BASE_APP_URL}/api/auth/dropbox/callback`;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

interface DropboxTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  uid: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface DropboxUserInfo {
  account_id: string;
  name: {
    given_name: string;
    surname: string;
    display_name: string;
  };
  email: string;
  email_verified: boolean;
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== Dropbox OAuth Callback Handler ===");
    console.log("Request URL:", request.url);
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("Callback params:", { code, state, error });

    // Check for OAuth errors
    if (error) {
      console.error("Dropbox OAuth error:", error);
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=oauth_error&details=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      console.error("Missing code in Dropbox OAuth callback");
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=missing_code`
      );
    }

    // Verify state parameter for CSRF protection (only if state exists)
    if (state) {
      const storedState = request.cookies.get("oauth_state")?.value;
      console.log("Stored state:", storedState);
      console.log("Received state:", state);
      
      if (!storedState || storedState !== state) {
        console.error("Invalid state parameter in Dropbox OAuth callback");
        return NextResponse.redirect(
          `${BASE_APP_URL}/login?error=invalid_state`
        );
      }
    } else {
      console.warn("No state parameter received - continuing without CSRF check");
    }

    if (!DROPBOX_CLIENT_ID || !DROPBOX_CLIENT_SECRET) {
      console.error("Dropbox OAuth not configured");
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=oauth_config`
      );
    }

    // Exchange authorization code for access token
    console.log("Exchanging code for token...");
    const tokenResponse = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: DROPBOX_CLIENT_ID,
        client_secret: DROPBOX_CLIENT_SECRET,
        redirect_uri: DROPBOX_REDIRECT_URI,
      }),
    });

    console.log("Token response status:", tokenResponse.status);
    
    const responseText = await tokenResponse.text();
    console.log("Token response text:", responseText);
    
    // Try to parse JSON, but handle if it's not JSON
    let tokens: DropboxTokenResponse;
    try {
      tokens = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse token response as JSON:", responseText);
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=token_exchange&details=${encodeURIComponent("Invalid response format")}`
      );
    }
    
    console.log("Tokens received:", tokens);
    
    // Check if there was an error in the token response
    if (tokens.error) {
      console.error("Dropbox token error:", tokens.error, tokens.error_description);
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=token_error&details=${encodeURIComponent(tokens.error_description || tokens.error)}`
      );
    }

    // Get user information from Dropbox
    console.log("Fetching user info...");
    const userResponse = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`,
      },
    });

    console.log("User info response status:", userResponse.status);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Failed to fetch user info:", errorText);
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=user_info&details=${encodeURIComponent(errorText)}`
      );
    }

    const dropboxUser: DropboxUserInfo = await userResponse.json();
    console.log("Dropbox user info:", dropboxUser);

    // Check if email is verified
    if (!dropboxUser.email_verified) {
      console.error("Dropbox user email not verified");
      return NextResponse.redirect(
        `${BASE_APP_URL}/login?error=unverified_email`
      );
    }

    // Check if user exists or create new user
    let user = await db.user.findUnique({
      where: { email: dropboxUser.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        activeWorkspaceId: true,
        avatarUrl: true,
      },
    });

    console.log("Existing user:", user);

    if (!user) {
      // Create new user with Dropbox OAuth
      console.log("Creating new user...");
      const result = await db.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            name: dropboxUser.name.display_name || `${dropboxUser.name.given_name} ${dropboxUser.name.surname}`,
            email: dropboxUser.email,
            password: "", // No password for OAuth users
            phone: "", // Default empty phone
            avatarUrl: null, // Dropbox doesn't provide avatar URL in this API
            googleAccessToken: null,
            googleRefreshToken: null,
            googleTokenExpiry: null,
            dropboxAccessToken: tokens.access_token,
            dropboxRefreshToken: tokens.refresh_token,
            dropboxTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
          },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            activeWorkspaceId: true,
            avatarUrl: true,
          },
        });

        // Create default 'Personal' workspace
        const workspace = await tx.workspace.create({
          data: {
            name: "Personal",
            userId: newUser.id,
          },
        });

        // Update user to set the Personal workspace as active
        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { activeWorkspaceId: workspace.id },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            activeWorkspaceId: true,
            avatarUrl: true,
          },
        });

        return updatedUser;
      });

      user = result;
      console.log("New user created:", user);
    } else {
      console.log("User already exists");
      // Update existing user with Dropbox tokens
      await db.user.update({
        where: { id: user.id },
        data: {
          dropboxAccessToken: tokens.access_token,
          dropboxRefreshToken: tokens.refresh_token,
          dropboxTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log("JWT token created");

    // Create response with redirect to home
    const response = NextResponse.redirect(
      `${BASE_APP_URL}/home?auth=success`
    );

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // Clear the OAuth state cookie if it exists
    if (request.cookies.get("oauth_state")) {
      response.cookies.delete("oauth_state");
    }

    console.log("Redirecting to home");
    return response;
  } catch (error) {
    console.error("Dropbox OAuth callback error:", error);
    return NextResponse.redirect(
      `${BASE_APP_URL}/login?error=oauth_callback&details=${encodeURIComponent((error as Error).message)}`
    );
  }
}