"use client";

// Hooks
import { useEffect, useRef, useState } from "react";
import { useAddVideoView } from "@/hooks/use-videos";
import { useUser } from "@/hooks/use-current-user";
import { useVideoViewers } from "@/hooks/use-video-viewers";

// Utils
import { getUserInitials } from "@/lib/user-utils";

// Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Interfaces
import { Video } from "@/interfaces/videos";

interface InfoSectionProps {
  video: Video;
}

// Generate a session ID that persists across browser sessions
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'crema_session_id';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

export default function InfoSection({ video }: InfoSectionProps) {
  const addVideoView = useAddVideoView();
  const { user } = useUser();
  const { data: viewersData, isLoading: isLoadingViewers } = useVideoViewers(video.id);
  const hasTrackedView = useRef(false);
  const [sessionId] = useState(() => getOrCreateSessionId());

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
        console.error('Failed to track video view:', error);
      }
    };

    trackView();
  }, [video.id, user?.id, sessionId]); // Removed addVideoView from deps to prevent infinite loop

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
                    : '?';
                  
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
