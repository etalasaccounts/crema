"use client";

// Hooks & Next
import { useVideos } from "@/hooks/use-videos";
import Link from "next/link";

// Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VideoThumbnail } from "@/components/video-thumbnail";
import { getUserInitials } from "@/lib/user-utils";
import { VideoListActions } from "./video-actions";

import Loading from "./loading";
import Error from "./error";

function VideoList() {
  const { data: videos, isLoading, isError } = useVideos();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            fill="none"
            aria-labelledby="title desc"
          >
            <rect
              x="24"
              y="64"
              width="148"
              height="128"
              rx="28"
              stroke="#0F172A"
              stroke-width="12"
            />
            <polygon points="184,100 232,84 232,172 184,156" fill="#0F172A" />
            <circle cx="64" cy="96" r="10" fill="#EF4444" />
            <circle cx="96" cy="96" r="6" fill="#0F172A" />
          </svg>
        </div>
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
        <div
          key={video.id}
          className="p-4 flex flex-col rounded-2xl hover:bg-accent transition-all duration-200 relative"
        >
          <Link href={`/watch/${video.id}`} className="block">
            <VideoThumbnail
              videoUrl={video.videoUrl}
              title={video.title}
              duration={video.duration}
              thumbnailUrl={video.thumbnailUrl}
            />
          </Link>
          <div className="gap-1 w-full">
            <div className="flex justify-between items-center">
              <Link href={`/watch/${video.id}`} className="flex-1">
                <h4 className="text-lg font-medium hover:text-primary transition-colors">
                  {video.title}
                </h4>
              </Link>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {/* {video.views} views */}
                </p>
                {/* <VideoActions video={video} /> */}
                <VideoListActions video={video} />
              </div>
            </div>
            <Link href={`/watch/${video.id}`} className="block">
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
                  <p className="text-sm text-muted-foreground"></p>
                </div>
              </div>
            </Link>
          </div>
        </div>
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
