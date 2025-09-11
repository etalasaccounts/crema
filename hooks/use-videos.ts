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

const fetchVideo = async (id: string) => {
  const response = await fetch(`/api/videos/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch video");
  }
  const data = await response.json();
  return data.video;
};

const fetchVideoWithComments = async (id: string) => {
  const response = await fetch(`/api/videos/${id}?includeComments=true`);
  if (!response.ok) {
    throw new Error("Failed to fetch video with comments");
  }
  const data = await response.json();
  return data.video;
};

export const useVideo = (id: string) => {
  return useQuery({
    queryKey: ["video", id],
    queryFn: () => fetchVideo(id),
    enabled: !!id,
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

export const useUpdateVideoTitle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { videoId: string; title: string }) => {
      const response = await fetch(`/api/videos/${data.videoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update video title");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the specific video with comments
      queryClient.invalidateQueries({
        queryKey: ["video", variables.videoId, "with-comments"],
      });
      // Also invalidate the videos list
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast("Video title updated successfully");
    },
    onError: (error) => {
      console.error("Error updating video title:", error);
      toast("Failed to update video title");
    },
  });
};

// Hook untuk polling status video sampai URL tersedia (dengan comments)
export const useVideoStatus = (id: string) => {
  return useQuery({
    queryKey: ["video", id, "with-comments"],
    queryFn: () => fetchVideoWithComments(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Ambil data dari query state
      const data = query.state.data as Video;
      // Stop polling jika videoUrl sudah ada dan tidak kosong
      if (data?.videoUrl && data.videoUrl.trim() !== "") {
        return false;
      }
      // Lanjutkan polling setiap 2 detik jika videoUrl masih kosong/null
      return 2000;
    },
    refetchIntervalInBackground: false, // Hentikan polling saat tab tidak aktif
    staleTime: 0,
  });
};
