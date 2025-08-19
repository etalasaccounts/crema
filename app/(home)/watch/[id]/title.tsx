// Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/user-utils";

interface TitleSectionInterface {
  id: number;
  title: string;
  user: {
    name: string;
  };
  workspace: string;
  views: number;
  viewers: {
    name: string;
  }[];
}

export default function TitleSection({
  video,
}: {
  video: TitleSectionInterface;
}) {
  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex flex-col flex-1 gap-3">
        {/* Title */}
        <h1 className="text-2xl font-medium">{video.title}</h1>

        {/* User */}
        <div className="flex gap-3 items-center w-fit">
          <Avatar>
            <AvatarFallback>{getUserInitials(video.user.name)}</AvatarFallback>
          </Avatar>{" "}
          <div className="flex flex-col">
            <p className="font-medium">{video.user.name}</p>
            <p className="text-sm text-muted-foreground ">{video.workspace}</p>
          </div>
        </div>
      </div>

      {/* Views */}
      <div className="flex gap-2 items-center">
        {" "}
        <p className="text-sm text-muted-foreground">{video.views} views</p>
        {video.views > 0 && (
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>ER</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}
