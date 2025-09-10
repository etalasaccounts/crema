import { NextRequest, NextResponse } from "next/server";

// Bunny.net Stream Configuration
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "";
const BUNNY_STREAM_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";

// Legacy Storage Configuration (for fallback/migration)
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD || "";
const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || "crema";
const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "sg.storage.bunnycdn.com";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "crema.b-cdn.net";

export async function POST(request: NextRequest) {
  try {
    // Check if Stream configuration is available, otherwise fallback to Storage
    const useStream = BUNNY_STREAM_API_KEY && BUNNY_STREAM_LIBRARY_ID && BUNNY_STREAM_CDN_HOSTNAME;
    
    if (!useStream && (!BUNNY_STORAGE_PASSWORD || !BUNNY_STORAGE_ZONE_NAME)) {
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

    // Read the file as an array buffer
    const buffer = await videoBlob.arrayBuffer();

    if (useStream) {
      // Use Bunny Stream service
      return await uploadToStream(buffer, videoBlob.name);
    } else {
      // Fallback to Storage service
      return await uploadToStorage(buffer, videoBlob.name);
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

// Upload to Bunny Stream service (preferred)
async function uploadToStream(buffer: ArrayBuffer, originalFilename: string) {
  try {
    // Step 1: Create video object in Stream
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const title = `gaffer-${timestamp}-${random}`;
    
    const createVideoResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          "AccessKey": BUNNY_STREAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
        }),
      }
    );

    if (!createVideoResponse.ok) {
      const errorText = await createVideoResponse.text();
      console.error("Failed to create video object:", errorText);
      return NextResponse.json({
        success: false,
        error: `Failed to create video object: ${createVideoResponse.status}`,
        details: errorText,
      }, { status: 500 });
    }

    const videoData = await createVideoResponse.json();
    const videoId = videoData.guid;

    if (!videoId) {
      console.error("No video ID returned from Stream API");
      return NextResponse.json({
        success: false,
        error: "No video ID returned from Stream API",
      }, { status: 500 });
    }

    // Step 2: Upload video binary data
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          "AccessKey": BUNNY_STREAM_API_KEY,
          "Content-Type": "video/webm",
        },
        body: new Uint8Array(buffer),
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Failed to upload video binary:", errorText);
      return NextResponse.json({
        success: false,
        error: `Failed to upload video binary: ${uploadResponse.status}`,
        details: errorText,
      }, { status: 500 });
    }

    // Generate Stream URLs
    const streamUrl = `https://video.bunnycdn.com/play/${BUNNY_STREAM_LIBRARY_ID}/${videoId}`;
    const hlsUrl = `https://${BUNNY_STREAM_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
    const mp4Url = `https://${BUNNY_STREAM_CDN_HOSTNAME}/${videoId}/play_720p.mp4`;

    console.log("Stream upload successful. Video ID:", videoId);
    console.log("Stream URL:", streamUrl);

    return NextResponse.json({
      success: true,
      url: mp4Url, // Use MP4 URL for direct video playback
      videoId: videoId,
      streamUrl: streamUrl,
      hlsUrl: hlsUrl,
      mp4Url: mp4Url,
      service: "stream",
    });

  } catch (error) {
    console.error("Error during Stream upload:", error);
    return NextResponse.json({
      success: false,
      error: "Error during Stream upload process",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

// Fallback to Storage service (legacy)
async function uploadToStorage(buffer: ArrayBuffer, originalFilename: string) {
  try {
    // Generate a unique filename with timestamp - avoid special characters
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `gaffer-${timestamp}-${random}.webm`;

    // Create a storage URL using the correct Bunny.net format
    const storageUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE_NAME}/${filename}`;

    // Create a buffer from the array buffer for the request body
    const arrayBufferView = new Uint8Array(buffer);
    
    const response = await fetch(storageUrl, {
      method: "PUT",
      headers: {
        "AccessKey": BUNNY_STORAGE_PASSWORD.trim(),
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
    
    if (!response.ok) {
      console.error("Storage upload failed with status:", response.status);
      console.error("Response text:", responseText);
      return NextResponse.json({ 
        success: false, 
        error: `Upload to Bunny.net Storage failed with status ${response.status}`,
        details: responseText
      }, { status: 500 });
    }
    
    // Use the CDN hostname for public access
    const directStorageUrl = `https://${BUNNY_CDN_HOSTNAME}/${filename}`;
    
    console.log("Storage upload successful. Using URL:", directStorageUrl);
    
    // Return successful response with URL
    return NextResponse.json({ 
      success: true, 
      url: directStorageUrl,
      storageUrl: storageUrl,
      service: "storage"
    });
    
  } catch (uploadError) {
    console.error("Error during Storage upload:", uploadError);
    return NextResponse.json({ 
      success: false, 
      error: "Error during Storage upload process",
      details: uploadError instanceof Error ? uploadError.message : String(uploadError)
    }, { status: 500 });
  }
}