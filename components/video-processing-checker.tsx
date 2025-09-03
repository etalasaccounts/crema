"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface VideoData {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
}

export function VideoProcessingChecker({ videoId }: { videoId: string }) {
  const [isProcessing, setIsProcessing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const checkVideoStatus = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.video && data.video.videoUrl && data.video.videoUrl !== "") {
            // Video has been processed, stop polling
            setIsProcessing(false);
            // Refresh the page to show the video player
            router.refresh();
          }
        }
      } catch (error) {
        console.error("Error checking video status:", error);
      }
    };

    // Only start polling if we're currently processing
    if (isProcessing) {
      // Check every 3 seconds
      intervalId = setInterval(checkVideoStatus, 3000);
      
      // Also check immediately
      checkVideoStatus();
    }

    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [videoId, isProcessing, router]);

  return null;
}