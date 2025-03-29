import { NextRequest, NextResponse } from "next/server";

// This should be set in your environment variables
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || "";
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "";
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || "";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting upload to Bunny.net with new authentication method");
    
    // Make sure the API key is defined
    if (!BUNNY_API_KEY || !BUNNY_STORAGE_ZONE) {
      console.error("Missing Bunny.net configuration");
      return NextResponse.json({ 
        success: false, 
        error: "Bunny.net configuration is missing" 
      }, { status: 500 });
    }

    // Get the form data from the request
    const formData = await request.formData();
    const videoBlob = formData.get("video") as File;
    
    if (!videoBlob) {
      console.error("No video file in request");
      return NextResponse.json({ 
        success: false, 
        error: "No video file included in request" 
      }, { status: 400 });
    }

    // Generate a unique filename with timestamp - avoid special characters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `gaffer-${timestamp}-${random}.webm`;
    console.log("Generated filename:", filename);
    
    // Read the file as an array buffer
    const buffer = await videoBlob.arrayBuffer();
    console.log("Video size:", buffer.byteLength, "bytes");

    // Create a storage URL - directly upload to the storage zone
    // Using their direct regional storage URL format
    const apiEndpoint = BUNNY_STORAGE_REGION.includes('.')
      ? `https://${BUNNY_STORAGE_REGION}`
      : 'https://storage.bunnycdn.com';
    
    const storageUrl = `${apiEndpoint}/${BUNNY_STORAGE_ZONE}/${filename}`;
    console.log("Using storage URL:", storageUrl);

    // Upload to Bunny.net Storage
    try {
      console.log("Uploading to Bunny.net with API key length:", BUNNY_API_KEY.length);
      
      // Create a buffer from the array buffer for the request body
      const arrayBufferView = new Uint8Array(buffer);
      
      const response = await fetch(storageUrl, {
        method: "PUT",
        headers: {
          "AccessKey": BUNNY_API_KEY.trim(),
          "Content-Type": "video/webm",
          "Accept": "application/json"
        },
        body: arrayBufferView
      });
      
      // Get response details for debugging
      let responseText;
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = "Could not read response body";
      }
      
      console.log("Response status:", response.status);
      console.log("Response details:", responseText);
      
      // Log all the response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Response headers:", headers);
      
      if (!response.ok) {
        console.error("Upload failed with status:", response.status);
        console.error("Response text:", responseText);
        return NextResponse.json({ 
          success: false, 
          error: `Upload to Bunny.net failed with status ${response.status}`,
          details: responseText
        }, { status: 500 });
      }
      
      // Create a shareable URL for the uploaded video
      // Let's try a direct URL to the storage for now to debug
      const directStorageUrl = `https://${BUNNY_STORAGE_ZONE}.b-cdn.net/${filename}`;
      console.log("Generated shareable URL:", directStorageUrl);
      
      // Return successful response with URL
      return NextResponse.json({ 
        success: true, 
        url: directStorageUrl,
        storageUrl: storageUrl, // Include for debugging
        apiKey: `${BUNNY_API_KEY.substring(0, 5)}...` // Just show first 5 chars for security
      });
      
    } catch (uploadError) {
      console.error("Error during upload:", uploadError);
      return NextResponse.json({ 
        success: false, 
        error: "Error during upload process",
        details: uploadError instanceof Error ? uploadError.message : String(uploadError)
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("General error in upload handler:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to process video upload",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 