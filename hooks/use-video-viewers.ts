import { useQuery } from "@tanstack/react-query";

interface VideoViewer {
  id: string;
  userId: string | null;
  sessionId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  viewedAt: string;
}

interface VideoViewersResponse {
  success: boolean;
  data: {
    totalViews: number;
    viewers: VideoViewer[];
  };
}

export const useVideoViewers = (videoId: string) => {
  return useQuery<VideoViewersResponse>({
    queryKey: ["video-viewers", videoId],
    queryFn: async () => {
      const response = await fetch(`/api/video-views/${videoId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch video viewers");
      }

      return response.json();
    },
    enabled: !!videoId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
