import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const thumbnailBlob = formData.get("thumbnail") as File;
    
    if (!thumbnailBlob) {
      console.error("No thumbnail file in request");
      return NextResponse.json({ 
        success: false, 
        error: "No thumbnail file included in request" 
      }, { status: 400 });
    }

    // Validate file type
    if (!thumbnailBlob.type.startsWith("image/")) {
      return NextResponse.json({
        success: false,
        error: "File must be an image"
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (thumbnailBlob.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: "File size must be less than 5MB"
      }, { status: 400 });
    }

    // Generate unique filename for thumbnail
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `thumbnails/thumb-${timestamp}-${random}.jpg`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, thumbnailBlob, {
      access: "public",
    });
    
    console.log("Thumbnail upload successful. URL:", blob.url);
    
    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      service: "vercel-blob"
    });
    
  } catch (error) {
    console.error("Error during thumbnail upload:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error during thumbnail upload process",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}