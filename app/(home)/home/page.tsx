// Hooks & Next
import Link from "next/link";

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { Ellipsis } from "lucide-react";
import { getUserInitials } from "@/lib/user-utils";
import { db } from "@/lib/db";

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

async function getVideos(): Promise<VideoData[]> {
  try {
    const videos = await db.video.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new Error("Failed to fetch videos");
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "few seconds ago";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

async function VideoList() {
  const videos = await getVideos();
  
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
        <p className="text-muted-foreground mb-4">
          Start recording to see your videos here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="p-4 flex flex-col rounded-3xl hover:bg-accent transition-all duration-200"
        >
          <VideoThumbnail
            videoUrl={video.videoUrl}
            title={video.title}
            duration={video.duration}
          />
          <div className="gap-1 w-full">
            {" "}
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">{video.title}</h4>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {video.views} views
                </p>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Ellipsis />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Avatar>
                <AvatarFallback>
                  {getUserInitials(video.user.name || "Unknown User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">
                  {video.user.name || "Unknown User"}
                </p>
                <p className="text-sm text-muted-foreground">{formatTimeAgo(video.createdAt)}</p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function page() {
  return (
    <div className="container">
      <VideoList />
    </div>
  );
}
