"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  duration?: number; // Duration in seconds from database
  onVideoEnded?: () => void;
  className?: string;
  isProcessing?: boolean; // New prop to indicate if video is still being processed
}

export function EnhancedVideoPlayer({
  src,
  duration: providedDuration,
  onVideoEnded,
  className = "",
  isProcessing = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [processedSrc, setProcessedSrc] = useState<string>(src);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process the video URL to ensure it's properly formatted for playback
  useEffect(() => {
    if (!src) {
      setProcessedSrc("");
      return;
    }

    try {
      // Validate URL format
      const url = new URL(src);

      // Ensure Dropbox URLs are properly formatted for direct playback
      if (url.hostname.includes("dropbox.com")) {
        // For Dropbox shared links, ensure they have the correct parameters
        if (url.hostname === "www.dropbox.com") {
          // Convert www.dropbox.com links to dl.dropboxusercontent.com for direct access
          if (url.pathname.startsWith("/s/")) {
            // Old style links
            url.searchParams.set("dl", "1");
          } else if (url.pathname.startsWith("/scl/")) {
            // New style links
            url.searchParams.set("raw", "1");
          }
        }

        setProcessedSrc(url.toString());
      } else {
        // For other URLs, use as-is
        setProcessedSrc(src);
      }
    } catch (e) {
      console.error("Video URL processing error:", e);
      // If URL is invalid, use as-is
      setProcessedSrc(src);
    }
  }, [src]);

  // Check if this is a Google Drive preview URL
  const isGoogleDrivePreview =
    processedSrc &&
    processedSrc.includes("drive.google.com/file/d/") &&
    processedSrc.includes("/preview");

  // Check if this is a Dropbox preview URL
  const isDropboxPreview =
    processedSrc &&
    processedSrc.includes("dropbox.com") &&
    processedSrc.includes("/s/");

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Use provided duration from database if available, otherwise fall back to video metadata
      const videoDuration =
        providedDuration && providedDuration > 0
          ? providedDuration
          : videoRef.current.duration;

      // Only set duration if it's a valid number
      if (videoDuration && !isNaN(videoDuration) && isFinite(videoDuration)) {
        setDuration(videoDuration);
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update time
  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setVolume(isMuted ? 1 : 0);
      setIsMuted(!isMuted);
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onVideoEnded) {
      onVideoEnded();
    }
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIframeLoading(false);
    setIframeError(
      "Failed to load video. Please check the video URL or try again later."
    );
  };

  // Handle refresh iframe
  const handleRefreshIframe = () => {
    setIframeLoading(true);
    setIframeError(null);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setShowControls(true);

    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Hide controls after 3 seconds of inactivity
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!document.fullscreenElement) {
        videoContainerRef.current.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message}`
          );
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Change playback speed
  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Reset iframe states when src changes
  useEffect(() => {
    if (isGoogleDrivePreview) {
      setIframeLoading(true);
      setIframeError(null);
    }
  }, [processedSrc, isGoogleDrivePreview]);

  // If video is still being processed, show processing state
  if (isProcessing) {
    return (
      <div className={`w-full ${className}`}>
        <div
          className="relative group rounded-xl bg-black w-full flex flex-col items-center justify-center"
          style={{ aspectRatio: "16/9" }}
        >
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Processing Your Video</h2>
            <p className="text-gray-300 mb-4">
              Your video is being uploaded to Dropbox. This may take a few
              moments...
            </p>
            <div className="w-64 mx-auto">
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>
          <Skeleton className="absolute inset-0 rounded-xl" />
        </div>
      </div>
    );
  }

  // Render Google Drive iframe player
  if (isGoogleDrivePreview) {
    return (
      <div className={`w-full ${className}`}>
        <div
          className="relative bg-black rounded-xl overflow-hidden"
          style={{ aspectRatio: "16/9" }}
        >
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm z-10">
              <div className="text-center">
                <p className="font-medium mb-2">Error:</p>
                <p className="mb-2">{iframeError}</p>
                <p className="text-xs mb-4">
                  Make sure the Google Drive video is set to &apos;Anyone with
                  the link can view&apos; in sharing settings.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshIframe}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {iframeLoading && !iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm z-10">
              <p>Loading video from Dropbox...</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={processedSrc}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Google Drive Video"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    );
  }

  // Render Dropbox iframe player
  if (isDropboxPreview) {
    return (
      <div className={`w-full ${className}`}>
        <div
          className="relative bg-black rounded-xl overflow-hidden"
          style={{ aspectRatio: "16/9" }}
        >
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm z-10">
              <div className="text-center">
                <p className="font-medium mb-2">Error:</p>
                <p className="mb-2">{iframeError}</p>
                <p className="text-xs mb-4">
                  There was an issue loading the video from Dropbox.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshIframe}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {iframeLoading && !iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm z-10">
              <p>Loading video from Dropbox...</p>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={processedSrc}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Dropbox Video"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={videoContainerRef}
        className="relative group rounded-xl bg-black w-full"
        style={{ aspectRatio: "16/9" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {processedSrc ? (
          <video
            ref={videoRef}
            src={processedSrc}
            className="w-full h-full object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onClick={togglePlay}
          >
            {/* Add this if you have subtitle tracks */}
            {/* <track kind="subtitles" src="path/to/captions.vtt" srclang="en" label="English" /> */}
          </video>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>No video source available</p>
          </div>
        )}

        {/* Play/Pause overlay button (only visible when paused) */}
        {!isPlaying && showControls && processedSrc && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
            <Button
              size="icon"
              className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm size-16"
              onClick={togglePlay}
            >
              <Play className="size-8" />
            </Button>
          </div>
        )}

        {/* Video controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls && processedSrc ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress bar */}
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full mb-3"
          />

          <div className="flex items-center justify-between">
            {/* Left side controls */}
            <div className="flex items-center space-x-2">
              {/* Play/Pause button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={togglePlay}
                className="rounded-full hover:bg-white/10 text-white hover:text-white size-10"
              >
                {isPlaying ? (
                  <Pause className="size-5" />
                ) : (
                  <Play className="size-5" />
                )}
              </Button>

              {/* Volume control */}
              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="rounded-full hover:bg-white/10 text-white hover:text-white size-10"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="size-5" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="size-5" />
                  ) : (
                    <Volume2 className="size-5" />
                  )}
                </Button>
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>

            {/* Time display */}
            <span className="absolute left-1/2 -translate-x-1/2 w-fit text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Right side controls */}
            <div className="flex items-center">
              {/* Playback speed */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:bg-white/10 text-white hover:text-white text-lg size-10"
                  >
                    1x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => changePlaybackSpeed(0.5)}>
                    {playbackRate === 0.5 ? "✓ " : ""}0.5x
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackSpeed(1)}>
                    {playbackRate === 1 ? "✓ " : ""}1x (Normal)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackSpeed(1.5)}>
                    {playbackRate === 1.5 ? "✓ " : ""}1.5x
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePlaybackSpeed(2)}>
                    {playbackRate === 2 ? "✓ " : ""}2x
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Fullscreen button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleFullscreen}
                className="rounded-full hover:bg-white/10 text-white hover:text-white size-10"
              >
                {isFullscreen ? (
                  <Minimize className="size-5" />
                ) : (
                  <Maximize className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
