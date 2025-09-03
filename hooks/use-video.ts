"use client";

import { useQuery } from "@tanstack/react-query";

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration?: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  workspace: {
    id: string;
    name: string;
  };
}

interface VideoResponse {
  success: boolean;
  video: VideoData;
  error?: string;
}

const fetchVideo = async (id: string): Promise<VideoData> => {
  const response = await fetch(`/api/videos/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Video not found");
    }
    throw new Error("Failed to fetch video data");
  }

  const data: VideoResponse = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch video");
  }

  return data.video;
};

export const useVideo = (id: string) => {
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => fetchVideo(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id, // Only fetch if ID is provided
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (video not found)
      if (error.message === "Video not found") {
        return false;
      }
      return failureCount < 3;
    },
  });
};