/**
 * Uploads a video blob to Bunny.net via the API route
 * @param blob - The video blob to upload
 * @returns The URL of the uploaded video or null if error
 */
export async function uploadVideoToBunny(blob: Blob): Promise<string | null> {
  try {
    // Create form data for the upload
    const formData = new FormData();
    formData.append(
      "video",
      blob,
      `recording-${new Date().toISOString()}.webm`
    );

    // Upload to API route
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Upload failed");
    }

    return data.url;
  } catch (error: unknown) {
    console.error("Error uploading video to Bunny:", error instanceof Error ? error.message : String(error));
    return null;
  }
} 