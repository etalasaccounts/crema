"use client";

import React, { useRef, useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import {
  Pause,
  Square,
  RefreshCcw,
  Trash,
  Maximize2,
  Minimize2,
  X,
  Video,
} from "lucide-react";

interface RecorderControllerProps {
  stream: MediaStream | null;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onRestartRecording: () => void;
  onDeleteRecording: () => void;
  recordingTime: number;
  isPaused: boolean;
  isRecording: boolean;
}

export function RecorderController({
  stream,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onRestartRecording,
  onDeleteRecording,
  recordingTime,
  isPaused,
  isRecording,
}: RecorderControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isSquare, setIsSquare] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("Setting video stream source in RecorderController");
      videoRef.current.srcObject = stream;

      // Log to debug stream status
      console.log(
        "Camera stream tracks:",
        stream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          id: t.id,
          label: t.label,
        }))
      );
    } else {
      console.log("Cannot set video source:", {
        hasVideoRef: !!videoRef.current,
        hasStream: !!stream,
        streamDetails: stream
          ? `${stream.id} with ${stream.getTracks().length} tracks`
          : "none",
      });
    }
  }, [stream]);

  // Video sizes (1:1 ratio)
  const videoSizes = {
    maximized: 344,
    minimized: 192,
  };

  // Container size needs to accommodate the video and controls
  const videoSize = videoSizes[isMinimized ? "minimized" : "maximized"];
  const containerWidth = videoSize + 300; // Extra space for controls

  // Only show video wrapper if we have a valid stream and it's not hidden
  const shouldShowVideo = Boolean(
    stream && !isVideoHidden && stream.getVideoTracks().length > 0
  );

  // Log whenever shouldShowVideo changes
  useEffect(() => {
    console.log("Camera preview visibility changed:", {
      shouldShowVideo,
      hasStream: !!stream,
      isVideoHidden,
      videoTracks: stream ? stream.getVideoTracks().length : 0,
    });
  }, [shouldShowVideo, stream, isVideoHidden]);

  return (
    <Rnd
      default={{
        x: window.innerWidth - (containerWidth + 40),
        y: window.innerHeight - (videoSize + 40),
        width: containerWidth,
        height: videoSize,
      }}
      size={{
        width: containerWidth,
        height: videoSize,
      }}
      minWidth={videoSizes.minimized + 300}
      minHeight={videoSizes.minimized}
      bounds="window"
      className="z-[9999] group"
      enableResizing={false}
    >
      <div className="flex flex-row items-center gap-4 h-full">
        {/* Video Wrapper - Maintains aspect ratio */}
        {shouldShowVideo && (
          <div
            className="relative"
            style={{ width: videoSize, height: videoSize }}
          >
            {/* Square container for the video */}
            <div
              className={`absolute inset-0 ${
                isSquare ? "rounded-lg" : "rounded-full"
              } overflow-hidden group bg-foreground`}
            >
              {/* Video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                muted
              />

              {/* Video Overlay Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => setIsVideoHidden(true)}
                  title="Hide Video"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex h-fit px-2.5 py-1.5 bg-foreground backdrop-blur-sm rounded-full items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={isPaused ? onResumeRecording : onPauseRecording}
            title={isPaused ? "Resume Recording" : "Pause Recording"}
            className="[&_svg]:size-5 hover:bg-white/10 rounded-full size-8"
            disabled={!isRecording}
          >
            <Pause fill="white" strokeWidth={0} />
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size={"icon"}
              className="[&_svg]:size-4 hover:bg-red-500/20 rounded-full size-8"
              onClick={onStopRecording}
              title="Stop Recording"
              disabled={!isRecording}
            >
              <Square fill="red" strokeWidth={0} />
            </Button>
            <span
              className={`text-sm mr-2 ${
                isRecording && !isPaused ? "text-red-400" : "text-background"
              }`}
            >
              {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRestartRecording}
            title="Restart Recording"
            className="[&_svg]:size-4 hover:bg-white/10 rounded-full size-8"
            disabled={!isRecording}
          >
            <RefreshCcw className="text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteRecording}
            title="Delete Recording"
            className="[&_svg]:size-4 hover:bg-white/10 rounded-full size-8"
            disabled={!isRecording}
          >
            <Trash className="text-white" />
          </Button>
          {isVideoHidden && stream && stream.getVideoTracks().length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVideoHidden(false)}
              title="Show Video"
              className="[&_svg]:size-4 hover:bg-white/10 rounded-full size-8"
            >
              <Video className="text-white" />
            </Button>
          )}
        </div>
      </div>
    </Rnd>
  );
}
