import { VideoPlayer } from "@/components/video-player";
import ToolbarSection from "./toolbar";
import TitleSection from "./title";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  duration: number | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  workspace: {
    id: string;
    name: string;
  };
}

async function getVideo(id: string): Promise<VideoData> {
  const video = await db.video.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!video) {
    notFound();
  }

  return video;
}

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await getVideo(id);

  // Transform the video data to match the expected format
  const transformedVideo = {
    id: parseInt(video.id),
    title: video.title,
    video_url: video.videoUrl,
    user: {
      name: video.user.name || "Unknown User",
    },
    workspace: video.workspace.name,
    views: video.views || 0,
    viewers: [], // We don't have viewers tracking yet
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-5">
      {/* Toolbar */}
      <ToolbarSection url={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/watch/${id}`} />
      {/* Video Player */}

      <VideoPlayer src={transformedVideo.video_url} duration={video.duration ?? undefined} />

      {/* Title */}
      <TitleSection video={transformedVideo} />
    </div>
  );
}
