import { NextRequest, NextResponse } from "next/server";

// Bunny.net Stream Configuration
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "";
const BUNNY_STREAM_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";

export async function POST(request: NextRequest) {
  try {
    // Check if Stream configuration is available, otherwise fallback to Storage
    const useStream =
      BUNNY_STREAM_API_KEY &&
      BUNNY_STREAM_LIBRARY_ID &&
      BUNNY_STREAM_CDN_HOSTNAME;

    // Get the form data from the request
    const formData = await request.formData();
    const videoBlob = formData.get("video") as File;

    if (!videoBlob) {
      console.error("No video file in request");
      return NextResponse.json(
        {
          success: false,
          error: "No video file included in request",
        },
        { status: 400 }
      );
    }

    // Read the file as an array buffer
    const buffer = await videoBlob.arrayBuffer();

    if (useStream) {
      // Use Bunny Stream service
      return await uploadToStream(buffer, videoBlob.name);
    }
  } catch (error) {
    console.error("General error in upload handler:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process video upload",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Upload to Bunny Stream service (preferred)
async function uploadToStream(buffer: ArrayBuffer, originalFilename: string) {
  try {
    // Step 1: Create video object in Stream
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const title = `screenbolt-${timestamp}-${random}`;

    const createVideoResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY,
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
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create video object: ${createVideoResponse.status}`,
          details: errorText,
        },
        { status: 500 }
      );
    }

    const videoData = await createVideoResponse.json();
    const videoId = videoData.guid;

    if (!videoId) {
      console.error("No video ID returned from Stream API");
      return NextResponse.json(
        {
          success: false,
          error: "No video ID returned from Stream API",
        },
        { status: 500 }
      );
    }

    // Step 2: Upload video binary data
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: BUNNY_STREAM_API_KEY,
          "Content-Type": "video/webm",
        },
        body: new Uint8Array(buffer),
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Failed to upload video binary:", errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to upload video binary: ${uploadResponse.status}`,
          details: errorText,
        },
        { status: 500 }
      );
    }

    // Generate embed-ready URL for database storage
    const embedUrl = `https://iframe.mediadelivery.net/embed/${BUNNY_STREAM_LIBRARY_ID}/${videoId}`;
    const hlsUrl = `https://${BUNNY_STREAM_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
    const mp4Url = `https://${BUNNY_STREAM_CDN_HOSTNAME}/${videoId}/play_720p.mp4`;

    console.log("Stream upload successful. Video ID:", videoId);
    console.log("Embed URL:", embedUrl);

    return NextResponse.json({
      success: true,
      url: embedUrl, // Use embed URL ready for display
      videoId: videoId,
      embedUrl: embedUrl,
      hlsUrl: hlsUrl,
      mp4Url: mp4Url,
      service: "stream",
    });
  } catch (error) {
    console.error("Error during Stream upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error during Stream upload process",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
