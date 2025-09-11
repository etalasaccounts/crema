import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface VideoStatusResponse {
  success: boolean;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  isProcessing: boolean;
  videoUrl: string | null;
  error?: string | null;
  bunnyStatus?: number;
  bunnyLength?: number;
}

interface UseVideoStatusOptions {
  videoId: string;
  enabled?: boolean;
  pollingInterval?: number; // in milliseconds
  onStatusChange?: (status: VideoStatusResponse) => void;
  onComplete?: (videoUrl: string) => void;
  onError?: (error: string) => void;
}

export const useVideoStatus = ({
  videoId,
  enabled = true,
  pollingInterval = 5000, // 5 seconds default
  onStatusChange,
  onComplete,
  onError,
}: UseVideoStatusOptions) => {
  const previousStatusRef = useRef<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const query = useQuery({
    queryKey: ["video-status", videoId],
    queryFn: async (): Promise<VideoStatusResponse> => {
      const response = await fetch(`/api/videos/${videoId}/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to get video status");
      }
      
      return data;
    },
    enabled: enabled && !!videoId && shouldPoll,
    refetchInterval: shouldPoll ? pollingInterval : false,
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale for real-time updates
    retry: (failureCount, error) => {
      // Retry up to 5 times for network errors
      if (failureCount < 5) {
        setRetryCount(failureCount);
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle status changes and callbacks
  useEffect(() => {
    if (query.data) {
      const currentStatus = query.data.status;
      
      // Call onStatusChange callback
      if (onStatusChange) {
        onStatusChange(query.data);
      }
      
      // Check if status changed
      if (previousStatusRef.current !== currentStatus) {
        previousStatusRef.current = currentStatus;
        
        // Handle completion
        if (currentStatus === "COMPLETED" && query.data.videoUrl && onComplete) {
          setShouldPoll(false); // Stop polling
          onComplete(query.data.videoUrl);
        }
        
        // Handle error
        if (currentStatus === "FAILED" && onError) {
          setShouldPoll(false); // Stop polling
          onError(query.data.error || "Video processing failed");
        }
      }
    }
  }, [query.data, onStatusChange, onComplete, onError]);

  // Handle query errors
  useEffect(() => {
    if (query.error) {
      console.error('Video status query error:', query.error);
      if (onError) {
        onError(query.error.message);
      }
    }
  }, [query.error, onError]);

  // Reset retry count on successful fetch
  useEffect(() => {
    if (query.data && !query.error) {
      setRetryCount(0);
    }
  }, [query.data, query.error]);

  // Enhanced refetch function that resets polling state
  const enhancedRefetch = async () => {
    setShouldPoll(true);
    setRetryCount(0);
    previousStatusRef.current = null;
    return await query.refetch();
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: enhancedRefetch,
    
    // Convenience properties
    status: query.data?.status,
    isProcessing: query.data?.isProcessing ?? false,
    videoUrl: query.data?.videoUrl,
    processingError: query.data?.error,
    
    // Bunny-specific data
    bunnyStatus: query.data?.bunnyStatus,
    bunnyLength: query.data?.bunnyLength,
    
    // Retry information
    retryCount,
    shouldPoll,
    
    // Manual control functions
    startPolling: () => setShouldPoll(true),
    stopPolling: () => setShouldPoll(false),
  };
};

// Helper hook for simple status checking without callbacks
export const useSimpleVideoStatus = (videoId: string, enabled = true) => {
  return useVideoStatus({
    videoId,
    enabled,
    pollingInterval: 3000, // Faster polling for simple use case
  });
};