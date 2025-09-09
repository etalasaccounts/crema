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
