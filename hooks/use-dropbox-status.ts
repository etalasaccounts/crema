"use client";

import { useQuery } from "@tanstack/react-query";

interface DropboxStatusResponse {
  hasAccess: boolean;
  accessToken?: string;
  expiresAt?: string;
}

const checkDropboxStatus = async (): Promise<DropboxStatusResponse> => {
  try {
    const response = await fetch("/api/auth/dropbox-token");
    
    if (response.ok) {
      const data = await response.json();
      return {
        hasAccess: true,
        accessToken: data.accessToken,
        expiresAt: data.expiresAt,
      };
    } else {
      // If status is 403, user hasn't authorized Dropbox
      // If status is 401, user is not authenticated
      return { hasAccess: false };
    }
  } catch (error) {
    console.error("Error checking Dropbox status:", error);
    return { hasAccess: false };
  }
};

export const useDropboxStatus = () => {
  return useQuery({
    queryKey: ["dropbox-status"],
    queryFn: checkDropboxStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth errors
  });
};