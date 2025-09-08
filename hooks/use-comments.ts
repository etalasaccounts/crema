"use client";

// Hooks & Next
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Components
import { toast } from "sonner";

// Interfaces
import { Comment } from "@/interfaces/comment";

// API
export const useComments = (videoId: string) => {
  return useQuery<Comment[]>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${videoId}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      return data.comments;
    },
  });
};

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
      // Invalidate and refetch comments for this video
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
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
      // Invalidate and refetch comments for this video
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      toast("Reply added successfully");
    },
    onError: (error) => {
      console.error("Error replying to comment:", error);
      toast("Failed to add reply");
    },
  });
};