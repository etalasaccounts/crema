import { NextRequest, NextResponse } from "next/server";

// Environment variables for Bunny.net Storage
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD || "";
const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || "crema";
const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "sg.storage.bunnycdn.com";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "crema.b-cdn.net";

export async function POST(request: NextRequest) {
  try {
    if (!BUNNY_STORAGE_PASSWORD || !BUNNY_STORAGE_ZONE_NAME) {
      console.error("Missing Bunny.net Storage configuration");
      return NextResponse.json({ 
        success: false, 
        error: "Bunny.net Storage configuration is missing" 
      }, { status: 500 });
    }

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

    // Generate unique filename for thumbnail
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `thumbnails/thumb-${timestamp}-${random}.jpg`;
    
    // Convert blob to buffer
    const buffer = await thumbnailBlob.arrayBuffer();
    
    // Upload to Bunny.net Storage
    const storageUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE_NAME}/${filename}`;
    
    const response = await fetch(storageUrl, {
      method: "PUT",
      headers: {
        "AccessKey": BUNNY_STORAGE_PASSWORD.trim(),
        "Content-Type": "image/jpeg",
        "Accept": "application/json"
      },
      body: new Uint8Array(buffer)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Thumbnail upload failed:", response.status, errorText);
      return NextResponse.json({ 
        success: false, 
        error: `Thumbnail upload failed with status ${response.status}`,
        details: errorText
      }, { status: 500 });
    }
    
    // Use the CDN hostname for public access
    const thumbnailUrl = `https://${BUNNY_CDN_HOSTNAME}/${filename}`;
    
    console.log("Thumbnail upload successful. URL:", thumbnailUrl);
    
    return NextResponse.json({ 
      success: true, 
      url: thumbnailUrl,
      service: "storage"
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