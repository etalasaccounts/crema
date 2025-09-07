import { getVideo } from "@/lib/db/videos";
import { EnhancedVideoPlayer } from "@/components/enhanced-video-player";
import { ToolbarSection } from "./toolbar";
import TitleSection from "./info-section";
import { notFound } from "next/navigation";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);

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
      <EnhancedVideoPlayer
        src={video.videoUrl}
        duration={video.duration ?? undefined}
        isProcessing={false}
        videoId={id}
      />

      {/* Title */}
      <TitleSection video={video} />
    </div>
  );
}
