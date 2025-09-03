/**
 * Initialize a resumable upload session with Google Drive
 * @param accessToken - Google OAuth access token
 * @param filename - The filename for the uploaded file
 * @param mimeType - The MIME type of the file
 * @returns The upload URL or null if error
 */
export async function initResumableUpload(
  accessToken: string,
  filename: string,
  mimeType: string
): Promise<string | null> {
  try {
    const metadata = {
      name: filename,
      mimeType: mimeType,
    };

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to initialize resumable upload:', errorText);
      return null;
    }

    // Get the upload URL from the Location header
    const uploadUrl = response.headers.get('Location');
    if (!uploadUrl) {
      console.error('Upload URL not found in response headers');
      return null;
    }

    return uploadUrl;
  } catch (error) {
    console.error('Error initializing resumable upload:', error);
    return null;
  }
}

/**
 * Upload a chunk of data to Google Drive
 * @param uploadUrl - The resumable upload URL
 * @param chunk - The data chunk to upload
 * @param startByte - The starting byte position
 * @param endByte - The ending byte position
 * @param totalSize - The total size of the file
 * @returns The file ID if upload is complete, null if not complete, undefined if error
 */
export async function uploadChunk(
  uploadUrl: string,
  chunk: ArrayBuffer,
  startByte: number,
  endByte: number,
  totalSize: number
): Promise<string | null | undefined> {
  try {
    const contentRange = `bytes ${startByte}-${endByte}/${totalSize}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': contentRange,
        'Content-Length': chunk.byteLength.toString(),
      },
      body: chunk,
    });

    // Handle different response statuses
    if (response.status === 308) {
      // Resume incomplete - upload can continue
      return null;
    } else if (response.status === 200 || response.status === 201) {
      // Upload complete
      const result = await response.json();
      return result.id;
    } else {
      const errorText = await response.text();
      console.error(`Upload failed with status ${response.status}:`, errorText);
      return undefined;
    }
  } catch (error) {
    console.error('Error uploading chunk:', error);
    return undefined;
  }
}

export function getFileUrls(fileId: string) {
  return {
    streamUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`,
  };
}

/**
 * Set file permissions to make it publicly readable
 * @param accessToken - Google OAuth access token
 * @param fileId - The ID of the file
 * @returns True if successful, false if error
 */
export async function makeFilePublic(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to set file permissions:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting file permissions:', error);
    return false;
  }
}

/**
 * Upload a video blob to Google Drive using resumable upload
 * @param accessToken - Google OAuth access token
 * @param blob - The video blob to upload
 * @param filename - The filename for the uploaded file
 * @returns The URL of the uploaded file or null if error
 */
export async function uploadVideoToGoogleDrive(
  accessToken: string,
  blob: Blob,
  filename: string = `recording-${new Date().toISOString()}.webm`
): Promise<string | null> {
  try {
    // Initialize resumable upload
    const uploadUrl = await initResumableUpload(accessToken, filename, blob.type || 'video/webm');
    if (!uploadUrl) {
      throw new Error('Failed to initialize resumable upload');
    }

    // Upload the file in chunks
    const CHUNK_SIZE = 256 * 1024; // 256KB chunks
    const totalSize = blob.size;
    let startByte = 0;

    while (startByte < totalSize) {
      const endByte = Math.min(startByte + CHUNK_SIZE - 1, totalSize - 1);
      const chunk = blob.slice(startByte, endByte + 1);
      const arrayBuffer = await chunk.arrayBuffer();
      
      const result = await uploadChunk(uploadUrl, arrayBuffer, startByte, endByte, totalSize);
      
      if (result === undefined) {
        // Error occurred
        throw new Error('Failed to upload chunk');
      } else if (result !== null) {
        // Upload complete, get the file ID
        const fileId = result;
        
        // Make the file publicly readable
        await makeFilePublic(accessToken, fileId);
        
        // Get the file URLs
        const urls = getFileUrls(fileId);
        if (urls) {
          // Return Google Drive preview URL for iframe embedding
          return urls.streamUrl;
        } else {
          throw new Error('Failed to get file URLs');
        }
      }
      
      // Move to next chunk
      startByte = endByte + 1;
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading video to Google Drive:', error);
    return null;
  }
}