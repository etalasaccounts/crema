"use client";

import { useVideoWithComments } from "@/hooks/use-videos";
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
        videoUrl={video.videoUrl}
        source={video.source}
        title={video.title}
        className="w-full aspect-video"
        controls
        autoPlay={false}
      />

      {/* Title */}
      <TitleSection video={video} />

      {/* Comments */}
      <CommentSection
        videoId={id}
        comments={video.comments}
        isLoading={isLoading}
      />
    </div>
  );
}
