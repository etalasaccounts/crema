"use client";

// Hooks
import { useEffect, useRef, useState } from "react";
import { useAddVideoView, useUpdateVideoTitle } from "@/hooks/use-videos";
import { useUser } from "@/hooks/use-auth";
import { useVideoViewers } from "@/hooks/use-video-viewers";

// Utils
import { getUserInitials } from "@/lib/user-utils";

// Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

// Interfaces
import { Video } from "@/interfaces/videos";

interface InfoSectionProps {
  video: Video;
}

// Generate a session ID that persists across browser sessions
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const storageKey = "screenbolt_session_id";
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

export default function InfoSection({ video }: InfoSectionProps) {
  const addVideoView = useAddVideoView();
  const updateVideoTitle = useUpdateVideoTitle();
  const { user } = useUser();
  const { data: viewersData, isLoading: isLoadingViewers } = useVideoViewers(
    video.id
  );
  const hasTrackedView = useRef(false);
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(video.title);

  // Update titleValue when video.title changes (from cache invalidation)
  useEffect(() => {
    setTitleValue(video.title);
  }, [video.title]);

  useEffect(() => {
    // Prevent multiple view tracking for the same video
    if (hasTrackedView.current || !video.id) {
      return;
    }

    const trackView = async () => {
      try {
        const viewData: {
          videoId: string;
          userId?: string;
          sessionId?: string;
        } = {
          videoId: video.id,
        };

        if (user?.id) {
          viewData.userId = user.id;
        } else {
          viewData.sessionId = sessionId;
        }

        await addVideoView.mutateAsync(viewData);
        hasTrackedView.current = true;
      } catch (error) {
        console.error("Failed to track video view:", error);
      }
    };

    trackView();
  }, [video.id, user?.id, sessionId]); // Removed addVideoView from deps to prevent infinite loop

  return (
    <div className="flex flex-row justify-between gap-4">
      <div className="flex flex-col flex-1 gap-3">
        {/* Title */}
        {isEditingTitle ? (
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={async () => {
              setIsEditingTitle(false);
              if (titleValue !== video.title && titleValue.trim()) {
                try {
                  await updateVideoTitle.mutateAsync({
                    videoId: video.id,
                    title: titleValue.trim(),
                  });
                  // titleValue will be updated via useEffect when video.title changes from cache invalidation
                } catch (error) {
                  console.error("Failed to update video title:", error);
                  setTitleValue(video.title); // Reset on error
                }
              } else {
                setTitleValue(video.title); // Reset if empty or unchanged
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                setTitleValue(video.title);
                setIsEditingTitle(false);
              }
            }}
            className="text-2xl font-medium p-2 h-auto"
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-medium cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
            onClick={() => {
              setIsEditingTitle(true);
              setTitleValue(video.title);
            }}
          >
            {titleValue}
          </h1>
        )}

        {/* User */}
        <div className="flex gap-3 items-center w-fit">
          <Avatar>
            <AvatarFallback>{getUserInitials(video.user.name)}</AvatarFallback>
          </Avatar>{" "}
          <div className="flex flex-col">
            <p className="font-medium">{video.user.name}</p>
            {/* <p className="text-sm text-muted-foreground ">{video.workspace}</p> */}
          </div>
        </div>
      </div>

      {/* Views */}
      <div className="flex gap-2 items-center">
        {isLoadingViewers ? (
          <p className="text-sm text-muted-foreground">Loading views...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {viewersData?.data.totalViews || 0} views
            </p>
            {(viewersData?.data.totalViews ?? 0) > 0 && (
              <div className="*:data-[slot=avatar]:ring-background flex -space-x-4 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                {viewersData?.data.viewers.slice(0, 3).map((viewer, index) => {
                  const initials = viewer.user
                    ? getUserInitials(viewer.user.name)
                    : "?";

                  return (
                    <Avatar key={viewer.id || `anonymous-${index}`}>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
