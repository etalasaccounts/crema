"use client";

import { createClient } from "@/lib/supabase/client-browser";

const supabase = createClient();

interface UploadResponse {
  success: boolean;
  data?: { url: string; type: string; filename: string }[];
  error?: string;
}

export function uploadService() {
  const uploadFiles = async (files: File[]): Promise<UploadResponse> => {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        const bucketName = "etalas-ai";

        // Upload file with metadata
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type, // Specify file type
          });

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        // Return file URL, type, and original filename
        return { url: publicUrl, type: file.type, filename: file.name };
      });

      const results = await Promise.all(uploadPromises);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while uploading files",
      };
    }
  };

  return { uploadFiles };
}
