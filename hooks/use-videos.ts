"use client";

import { useQuery } from "@tanstack/react-query";

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  workspace: {
    id: string;
    name: string;
  };
}

interface VideosResponse {
  success: boolean;
  videos: VideoData[];
  error?: string;
}

const fetchVideos = async (): Promise<VideoData[]> => {
  const response = await fetch("/api/videos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  const data: VideosResponse = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Failed to fetch videos");
  }

  return data.videos;
};

export const useVideos = () => {
  return useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      return failureCount < 3;
    },
  });
};