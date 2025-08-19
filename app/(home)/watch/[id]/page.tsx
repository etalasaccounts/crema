"use client";

// Components
import { VideoPlayer } from "@/components/video-player";
import ToolbarSection from "./toolbar";
import TitleSection from "./title";
import { useVideo } from "@/hooks/use-video";
import { useLogVideoView } from "@/hooks/use-video-views";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { use, useEffect, useRef } from "react";

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: video, isLoading, error } = useVideo(id);
  const logViewMutation = useLogVideoView();
  const hasLoggedView = useRef(false);

  // Log video view when video loads (only once)
  useEffect(() => {
    if (video && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logViewMutation.mutate(id);
    }
  }, [video, id, logViewMutation]);

  if (isLoading) {
    return (
      <div className="flex flex-col max-w-5xl mx-auto gap-5">
        {/* Toolbar Skeleton */}
        <Skeleton className="h-12 w-full" />
        {/* Video Player Skeleton */}
        <Skeleton className="aspect-video w-full rounded-xl" />
        {/* Title Skeleton */}
        <div className="flex flex-row justify-between gap-4">
          <div className="flex flex-col flex-1 gap-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-3 items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col max-w-5xl mx-auto gap-5">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message === "Video not found"
              ? "This video could not be found. It may have been deleted or you don't have permission to view it."
              : "Failed to load video. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  // Transform the video data to match the expected format
  const transformedVideo = {
    id: parseInt(video.id),
    title: video.title,
    video_url: video.videoUrl,
    user: {
      name: video.user.name,
    },
    workspace: video.workspace.name,
    views: video.views || 0,
    viewers: [], // We don't have viewers tracking yet
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-5">
      {/* Toolbar */}
      <ToolbarSection url={`${window.location.origin}/watch/${id}`} />
      {/* Video Player */}

      <VideoPlayer 
        src={transformedVideo.video_url} 
        duration={video.duration} 
      />

      {/* Title */}
      <TitleSection video={transformedVideo} />
    </div>
  );
}
