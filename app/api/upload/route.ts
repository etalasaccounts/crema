import { NextRequest, NextResponse } from "next/server";

// Bunny.net Storage Configuration
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD || "";
const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || "crema";
const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "sg.storage.bunnycdn.com";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "crema.b-cdn.net";

export async function POST(request: NextRequest) {
  try {
    // Make sure the storage password is defined
    if (!BUNNY_STORAGE_PASSWORD || !BUNNY_STORAGE_ZONE_NAME) {
      console.error("Missing Bunny.net storage configuration");
      return NextResponse.json({ 
        success: false, 
        error: "Bunny.net storage configuration is missing" 
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

    
    // Read the file as an array buffer
    const buffer = await videoBlob.arrayBuffer();


    // Create a storage URL using the correct Bunny.net format
    const storageUrl = `https://${BUNNY_STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE_NAME}/${filename}`;


    // Upload to Bunny.net Storage
    try {

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
      


      
      // Log all the response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      
      if (!response.ok) {
        console.error("Upload failed with status:", response.status);
        console.error("Response text:", responseText);
        return NextResponse.json({ 
          success: false, 
          error: `Upload to Bunny.net failed with status ${response.status}`,
          details: responseText
        }, { status: 500 });
      }
      
      // First try to get the URL from the response if available
      let directStorageUrl;
      
      // Check if Bunny's response includes the final URL (in response body or headers)
      // Some CDNs provide this information
      if (responseText && typeof responseText === 'string' && responseText.includes('url')) {
        try {
          const responseData = JSON.parse(responseText);
          if (responseData.url) {
            directStorageUrl = responseData.url;
          }
        } catch (e) {
          // If parsing fails, continue to fallback
          console.log("Could not parse response as JSON");
        }
      }
      
      // If no URL was found in the response, use the CDN URL
      if (!directStorageUrl) {
        // Use the CDN hostname for public access
        directStorageUrl = `https://${BUNNY_CDN_HOSTNAME}/${filename}`;
      }
      
      console.log("Using URL for video:", directStorageUrl);
      
      // Return successful response with URL
      return NextResponse.json({ 
        success: true, 
        url: directStorageUrl,
        storageUrl: storageUrl
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