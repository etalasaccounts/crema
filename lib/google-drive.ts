import { toast } from "sonner";

interface GoogleDriveFileMetadata {
  name: string;
  mimeType: string;
}

interface GoogleDriveUploadResponse {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

interface ResumableUploadSession {
  uploadUrl: string;
  fileId?: string;
}

/**
 * Initialize Google Drive upload session
 */
export async function initResumableUpload(
  accessToken: string,
  metadata: GoogleDriveFileMetadata
): Promise<ResumableUploadSession> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initialize upload: ${errorText}`);
    }

    const uploadUrl = response.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("Upload URL not found in response headers");
    }

    return { uploadUrl };
  } catch (error) {
    console.error("Error initializing resumable upload:", error);
    throw error;
  }
}

/**
 * Upload a chunk of data to Google Drive
 */
export async function uploadChunk(
  uploadUrl: string,
  chunk: ArrayBuffer,
  startByte: number,
  endByte: number,
  totalBytes: number
): Promise<{ complete: boolean; fileId?: string }> {
  try {
    const contentRange = `bytes ${startByte}-${endByte}/${totalBytes}`;
    
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": contentRange,
        "Content-Length": chunk.byteLength.toString(),
      },
      body: chunk,
    });

    // Handle different response statuses
    if (response.status === 308) {
      // Resume incomplete - upload can continue
      return { complete: false };
    } else if (response.status === 200 || response.status === 201) {
      // Upload complete
      const data: GoogleDriveUploadResponse = await response.json();
      return { complete: true, fileId: data.id };
    } else {
      const errorText = await response.text();
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error("Error uploading chunk:", error);
    throw error;
  }
}

/**
 * Get the current upload status to determine resume point
 */
export async function getUploadStatus(
  uploadUrl: string,
  totalBytes: number
): Promise<number> {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes */${totalBytes}`,
      },
    });

    if (response.status === 308) {
      const range = response.headers.get("Range");
      if (range) {
        // Range is in format "bytes=0-12345"
        const endByte = parseInt(range.split("-")[1]);
        return endByte + 1; // Next byte to upload
      }
    }
    
    return 0; // Start from beginning
  } catch (error) {
    console.error("Error getting upload status:", error);
    return 0; // Start from beginning on error
  }
}

/**
 * Upload a video to Google Drive with resumable upload
 */
export async function uploadVideoToGoogleDrive(
  accessToken: string,
  videoBlob: Blob,
  onProgress?: (progress: number) => void,
  onError?: (error: string) => void
): Promise<string | null> {
  try {
    const CHUNK_SIZE = 256 * 1024; // 256KB chunks
    const totalBytes = videoBlob.size;
    
    // Initialize upload
    const metadata: GoogleDriveFileMetadata = {
      name: `recording-${new Date().toISOString()}.webm`,
      mimeType: "video/webm",
    };
    
    const { uploadUrl } = await initResumableUpload(accessToken, metadata);
    
    // Check if we need to resume
    let startByte = await getUploadStatus(uploadUrl, totalBytes);
    
    // Upload chunks
    while (startByte < totalBytes) {
      const endByte = Math.min(startByte + CHUNK_SIZE - 1, totalBytes - 1);
      const chunk = videoBlob.slice(startByte, endByte + 1);
      const arrayBuffer = await chunk.arrayBuffer();
      
      try {
        const result = await uploadChunk(
          uploadUrl,
          arrayBuffer,
          startByte,
          endByte,
          totalBytes
        );
        
        if (result.complete && result.fileId) {
          // Upload complete, get the file URL
          const fileResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${result.fileId}?fields=webViewLink`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            return fileData.webViewLink;
          } else {
            const errorText = await fileResponse.text();
            throw new Error(`Failed to get file URL: ${errorText}`);
          }
        }
        
        // Update progress
        const progress = Math.round(((endByte + 1) / totalBytes) * 100);
        onProgress?.(progress);
        
        // Move to next chunk
        startByte = endByte + 1;
      } catch (error) {
        console.error("Chunk upload error:", error);
        onError?.(`Upload failed at ${Math.round((startByte / totalBytes) * 100)}%`);
        throw error;
      }
    }
    
    return null; // Should not reach here
  } catch (error) {
    console.error("Error uploading video to Google Drive:", error);
    onError?.("Failed to upload video to Google Drive");
    return null;
  }
}