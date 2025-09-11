import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Bunny.net Stream Configuration
const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const BUNNY_STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "";
const BUNNY_STREAM_CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME || "";

interface BunnyVideoStatus {
  guid: string;
  title: string;
  status: number; // 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Finished, 4 = Error
  length: number;
  thumbnailUrl?: string;
  videoLibraryId: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    // Get video from database
    const video = await db.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        videoUrl: true,
        source: true,
      },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: "Video not found" },
        { status: 404 }
      );
    }

    // If video is not from Bunny Stream, return ready status
    if (video.source !== "Bunny") {
      return NextResponse.json({
        success: true,
        status: "ready",
        isProcessing: false,
        videoUrl: video.videoUrl,
        error: null,
      });
    }

    // Extract Bunny video ID from URL if available
    let bunnyVideoId: string | null = null;
    if (video.videoUrl) {
      const urlMatch = video.videoUrl.match(/\/([a-f0-9-]{36})\//i);
      if (urlMatch) {
        bunnyVideoId = urlMatch[1];
      }
    }

    if (!bunnyVideoId) {
      return NextResponse.json({
        success: true,
        status: "error",
        isProcessing: false,
        videoUrl: video.videoUrl,
        error: "Cannot extract Bunny video ID from URL",
      });
    }

    // Check Bunny Stream API for video status with retry mechanism
    let bunnyData: BunnyVideoStatus | null = null;
    let bunnyError: string | null = null;
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const bunnyResponse = await fetch(
          `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${bunnyVideoId}`,
          {
            headers: {
              AccessKey: BUNNY_STREAM_API_KEY,
            },
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);

        if (!bunnyResponse.ok) {
          const errorText = await bunnyResponse.text().catch(() => 'Unknown error');
          throw new Error(`Bunny API error ${bunnyResponse.status}: ${errorText}`);
        }

        bunnyData = await bunnyResponse.json();
        break; // Success, exit retry loop
        
      } catch (error) {
        console.error(`Bunny API attempt ${attempt} failed:`, error);
        bunnyError = error instanceof Error ? error.message : String(error);
        
        // If this is the last attempt, we'll handle the error below
        if (attempt === 3) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    // If we couldn't get data from Bunny after retries
    if (!bunnyData) {
      console.error("Failed to fetch from Bunny API after 3 attempts:", bunnyError);
      return NextResponse.json({
        success: true,
        status: "error",
        isProcessing: false,
        videoUrl: video.videoUrl,
        error: `Bunny Stream API unavailable: ${bunnyError}`,
        bunnyStatus: null,
        bunnyLength: null,
      });
    }
      
      // Map Bunny status to our processing status
      let newProcessingStatus = "ready";
      let newIsProcessing = false;
      let processingError: string | null = null;

      switch (bunnyData.status) {
        case 0: // Created
        case 1: // Uploaded
          newProcessingStatus = "pending";
          newIsProcessing = true;
          break;
        case 2: // Processing
          newProcessingStatus = "processing";
          newIsProcessing = true;
          break;
        case 3: // Finished
          newProcessingStatus = "ready";
          newIsProcessing = false;
          break;
        case 4: // Error
          newProcessingStatus = "error";
          newIsProcessing = false;
          processingError = "Video processing failed on Bunny Stream";
          break;
        default:
          console.warn("Unknown Bunny status:", bunnyData.status);
      }

      // Note: Processing status is tracked in memory only
      // Database only stores the final video URL and basic metadata

      return NextResponse.json({
        success: true,
        status: newProcessingStatus,
        isProcessing: newIsProcessing,
        videoUrl: video.videoUrl,
        error: processingError,
        bunnyStatus: bunnyData.status,
        bunnyLength: bunnyData.length,
      });
  } catch (error) {
    console.error("Error in video status check:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}