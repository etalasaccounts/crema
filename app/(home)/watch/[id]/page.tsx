"use client";

import { useVideoWithComments, useVideoStatus } from "@/hooks/use-videos";
import { VideoEmbed } from "@/components/video-embed";
import { ToolbarSection } from "./toolbar";
import TitleSection from "./info-section";
import { CommentSection } from "@/app/(home)/watch/[id]/comment-section";
import { notFound } from "next/navigation";
import { use } from "react";

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: video, isLoading, error } = useVideoWithComments(id);
  const { data: videoStatus } = useVideoStatus(id);

  if (error) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col max-w-5xl mx-auto gap-5">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="aspect-video bg-muted rounded animate-pulse" />
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="h-40 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!video) {
    notFound();
  }

  // Gunakan data terbaru dari videoStatus jika tersedia, fallback ke video
  const currentVideo = videoStatus || video;
  // Video sedang diproses jika videoUrl kosong atau null
  const isVideoProcessing = !currentVideo.videoUrl || currentVideo.videoUrl.trim() === '';
  if (isVideoProcessing) {
    return (
      <div className="flex flex-col max-w-5xl mx-auto gap-5">
        {/* Toolbar */}
        <ToolbarSection
          url={`${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/watch/${id}`}
          viewerCount={0}
        />

        {/* Video Processing State */}
        <div className="aspect-video bg-muted rounded flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Processing Video...</h3>
              <p className="text-muted-foreground">
                Your video is being processed and will be available shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <TitleSection video={currentVideo} />

        {/* Comments */}
        <CommentSection
          videoId={id}
          comments={currentVideo.comments || []}
          isLoading={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-5">
      {/* Toolbar */}
      <ToolbarSection
        url={`${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/watch/${id}`}
        viewerCount={0}
      />

      {/* Video Player */}
      <VideoEmbed
        videoUrl={currentVideo.videoUrl}
        source={currentVideo.source}
        title={currentVideo.title}
        className="w-full aspect-video"
        controls
        autoPlay={false}
      />

      {/* Title */}
      <TitleSection video={currentVideo} />

      {/* Comments */}
      <CommentSection
        videoId={id}
        comments={currentVideo.comments || []}
        isLoading={isLoading}
      />
    </div>
  );
}
