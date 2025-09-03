import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

interface GoogleTokenRefreshResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    
    // Get auth token from cookie
    const authToken = request.cookies.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.googleAccessToken) {
      return NextResponse.json(
        {
          error: 'Google Drive access not authorized. Please re-authenticate with Google.',
        },
        { status: 403 }
      );
    }

    let accessToken = user.googleAccessToken;

    // Check if token is still valid (with 5 minute buffer)
    const now = new Date();
    const tokenExpiry = user.googleTokenExpiry;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (tokenExpiry && now.getTime() >= tokenExpiry.getTime() - bufferTime) {
      // Token is expired or about to expire, refresh it
      if (!user.googleRefreshToken) {
        return NextResponse.json(
          {
            error: 'Google Drive access expired. Please re-authenticate with Google.',
          },
          { status: 403 }
        );
      }

      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: user.googleRefreshToken,
            grant_type: 'refresh_token',
          }),
        });

        if (!refreshResponse.ok) {
          return NextResponse.json(
            {
              error: 'Failed to refresh Google Drive access. Please re-authenticate.',
            },
            { status: 403 }
          );
        }

        const refreshData: GoogleTokenRefreshResponse = await refreshResponse.json();
        
        // Update user with new token
        await db.user.update({
          where: { id: user.id },
          data: {
            googleAccessToken: refreshData.access_token,
            googleTokenExpiry: new Date(Date.now() + refreshData.expires_in * 1000),
          },
        });

        accessToken = refreshData.access_token;
      } catch (error) {
        console.error('Error refreshing Google token:', error);
        return NextResponse.json(
          {
            error: 'Failed to refresh Google Drive access. Please re-authenticate.',
          },
          { status: 403 }
        );
      }
    }

    // Fetch video from Google Drive API v3
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Range': request.headers.get('range') || '', // Support range requests for video seeking
        },
      }
    );

    if (!driveResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video from Google Drive' },
        { status: driveResponse.status }
      );
    }

    // Create response with proper headers for video streaming
    const response = new NextResponse(driveResponse.body);
    
    // Copy important headers from Google Drive response
    response.headers.set('Content-Type', driveResponse.headers.get('content-type') || 'video/webm');
    response.headers.set('Content-Length', driveResponse.headers.get('content-length') || '');
    response.headers.set('Accept-Ranges', 'bytes'); // Enable video seeking
    response.headers.set('Content-Disposition', 'inline'); // Display in browser, not download
    
    // Handle range requests for video seeking
    if (driveResponse.headers.get('content-range')) {
      response.headers.set('Content-Range', driveResponse.headers.get('content-range') || '');
      response.headers.set('Status', '206'); // Partial content
    }

    return response;
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}