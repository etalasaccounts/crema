import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using the same method as /api/auth/me
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      console.error('Avatar upload error: No authentication token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify and decode JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (jwtError) {
      console.error('Avatar upload error: Invalid or expired token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch current user data from database to ensure they exist
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      console.error('Avatar upload error: User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the file from form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      console.error('Avatar upload error: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Avatar upload error: Invalid file type', file.type);
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Avatar upload error: File too large', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    console.log(`Uploading avatar for user ${user.id}`);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatars/${user.id}-${Date.now()}.${fileExtension}`;
    
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // Update user's avatar URL in database
    console.log(`Updating user ${user.id} with avatar URL: ${blob.url}`);
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { avatarUrl: blob.url },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    console.log(`Successfully updated avatar for user ${user.id}`);
    return NextResponse.json({
      success: true,
      user: updatedUser,
      avatarUrl: blob.url,
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    // More specific error messages based on error type
    if (error.message?.includes('Vercel Blob')) {
      return NextResponse.json(
        { error: 'Failed to upload to storage. Please try again.' },
        { status: 500 }
      );
    }
    
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}