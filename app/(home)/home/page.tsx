// Hooks & Next
import Link from "next/link";

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Ellipsis } from "lucide-react";
import { getUserInitials } from "@/lib/user-utils";

async function VideoList() {
  const videos = [
    {
      id: 1,
      slug: "lorem-ipsum-dolor-sit-amet",
      title: "Lorem ipsum dolor sit amet",
      user: {
        name: "John Doe",
      },
      views: 8,
    },
    {
      id: 2,
      title: "Video 2",
      user: {
        name: "Jane Doe",
      },
      views: 12,
    },
    {
      id: 3,
      title: "Video 3",
      user: {
        name: "John Doe",
      },
      views: 12,
    },
    {
      id: 4,
      title: "Video 4",
      user: {
        name: "Jane Doe",
      },
      views: 12,
    },
    {
      id: 5,
      title: "Video 5",
      user: {
        name: "John Doe",
      },
      views: 12,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.slug}`}
          className="p-4 flex flex-col rounded-3xl hover:bg-accent transition-all duration-200"
        >
          <div className="bg-muted-foreground aspect-video rounded-2xl"></div>
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
                  {getUserInitials(video.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">
                  {video.user.name}
                </p>
                <p className="text-sm text-muted-foreground">few seconds ago</p>
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
