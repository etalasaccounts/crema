import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=oauth_error`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=missing_code`
      );
    }

    // Verify state parameter for CSRF protection
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=invalid_state`
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=oauth_config`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=token_exchange`
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user information from Google
    const userResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
    );

    if (!userResponse.ok) {
      console.error('Failed to fetch user info:', await userResponse.text());
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=user_info`
      );
    }

    const googleUser: GoogleUserInfo = await userResponse.json();

    if (!googleUser.verified_email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=unverified_email`
      );
    }

    // Check if user exists or create new user
    let user = await db.user.findUnique({
      where: { email: googleUser.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        activeWorkspaceId: true,
      },
    });

    if (!user) {
      // Create new user with Google OAuth
      const result = await db.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            name: googleUser.name,
            email: googleUser.email,
            password: '', // No password for OAuth users
            phone: '', // Default empty phone
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
            name: 'Personal',
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
          },
        });

        return updatedUser;
      });

      user = result;
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

    // Create response with redirect to home
    const response = NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/home?auth=success`
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    // Clear the OAuth state cookie
    response.cookies.delete('oauth_state');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=email_exists`
        );
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login?error=oauth_callback`
    );
  }
}