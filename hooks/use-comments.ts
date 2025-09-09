"use client";

// Hooks & Next
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import { toast } from "sonner";

export const useCreateComment = (videoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create comment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch video with comments
      queryClient.invalidateQueries({ queryKey: ["video", videoId, "with-comments"] });
      toast("Comment added successfully");
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      toast("Failed to add comment");
    },
  });
};

export const useReplyToComment = (videoId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { commentId: string; content: string }) => {
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to reply to comment");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch video with comments
      queryClient.invalidateQueries({ queryKey: ["video", videoId, "with-comments"] });
      toast("Reply added successfully");
    },
    onError: (error) => {
      console.error("Error replying to comment:", error);
      toast("Failed to add reply");
    },
  });
};
