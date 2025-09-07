"use client";

// Hooks & Next
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Components
import { toast } from "sonner";

// Interfaces
import { Video } from "@/interfaces/videos";

// API
export const useVideos = () => {
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      const response = await fetch("/api/videos");
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      return response.json();
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch videos list
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast("Video deleted successfully");
      router.refresh();
    },
    onError: (error) => {
      console.error("Error deleting video:", error);
      toast("Failed to delete video");
    },
  });
};

export const useVideo = (id: string) => {
  return useQuery<Video>({
    queryKey: ["video", id],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }
      return response.json();
    },
  });
};

export const useAddVideoView = () => {
  return useMutation({
    mutationFn: async (data: {
      videoId: string;
      userId?: string;
      sessionId?: string;
    }) => {
      const response = await fetch("/api/video-views", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add video view");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Video view added successfully:", data.message);
    },
    onError: (error) => {
      console.error("Error adding video view:", error);
    },
  });
};
