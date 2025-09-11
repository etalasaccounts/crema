import type { Metadata } from "next";
import { db } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch video data from database
    const video = await db.video.findUnique({
      where: { id },
      select: {
        title: true,
        thumbnailUrl: true,
        duration: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!video) {
      return {
        title: "Video Not Found | Screenbolt",
        description: "The requested video could not be found.",
      };
    }

    const videoTitle = video.title || "Untitled Video";
    const videoDescription = `Watch ${videoTitle} on Screenbolt - Fast screen recording and video sharing platform.`;
    const authorName = video.user?.name || "Screenbolt User";
    const videoUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://Screenbolt.app"
    }/watch/${id}`;
    const thumbnailUrl = video.thumbnailUrl || "/assets/logo-black.png";

    return {
      title: videoTitle,
      description: videoDescription,
      openGraph: {
        type: "video.other",
        title: videoTitle,
        description: videoDescription,
        url: videoUrl,
        siteName: "Screenbolt",
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: videoTitle,
          },
        ],
        videos: [
          {
            url: videoUrl,
            width: 1280,
            height: 720,
            type: "video/mp4",
          },
        ],
      },
      twitter: {
        card: "player",
        title: videoTitle,
        description: videoDescription,
        images: [thumbnailUrl],
        players: {
          playerUrl: videoUrl,
          streamUrl: videoUrl,
          width: 1280,
          height: 720,
        },
      },
      other: {
        "video:duration": video.duration?.toString() || "0",
        "video:release_date": video.createdAt.toISOString(),
        "article:author": authorName,
      },
    };
  } catch (error) {
    console.error("Error generating video metadata:", error);
    return {
      title: "Video | Screenbolt",
      description: "Watch and share screen recordings on Screenbolt.",
    };
  }
}

export default function VideoLayout({ children }: Props) {
  return <>{children}</>;
}
