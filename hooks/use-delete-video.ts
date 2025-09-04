"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface DeleteVideoResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const deleteVideo = async (videoId: string): Promise<DeleteVideoResponse> => {
  const response = await fetch(`/api/videos/${videoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete video");
  }

  return response.json();
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVideo,
    onSuccess: (data) => {
      // Invalidate and refetch videos list
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });
};