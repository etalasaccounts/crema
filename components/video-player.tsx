"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Subtitles,
  Maximize,
  Minimize,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  src: string;
  duration?: number; // Duration in seconds from database
  onVideoEnded?: () => void;
  className?: string;
}

export function VideoPlayer({
  src,
  duration: providedDuration,
  onVideoEnded,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Use provided duration from database if available, otherwise fall back to video metadata
      const videoDuration = providedDuration && providedDuration > 0 
        ? providedDuration 
        : videoRef.current.duration;
      setDuration(videoDuration);
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
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        // Store the current volume before muting
        setVolume(videoRef.current.volume);
        videoRef.current.volume = 0;
      } else {
        // Restore the volume when unmuting
        videoRef.current.volume = volume;
      }
    }
  };

  // Toggle fullscreen
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

  // Toggle captions
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = !showCaptions ? "showing" : "hidden";
      }
    }
  };

  // Enter Picture-in-Picture mode
  const enterPiP = async () => {
    try {
      if (videoRef.current && document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement !== videoRef.current) {
          await videoRef.current.requestPictureInPicture();
        } else {
          await document.exitPictureInPicture();
        }
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  };

  // Format time (MM:SS)
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle mouse move to show controls
  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Handle video end
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onVideoEnded) {
      onVideoEnded();
    }
  };

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

  // Set duration from prop if provided
  useEffect(() => {
    if (providedDuration && providedDuration > 0) {
      setDuration(providedDuration);
    }
  }, [providedDuration]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={videoContainerRef}
        className="relative group rounded-xl bg-black w-full"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
        >
        {/* Add this if you have subtitle tracks */}
        {/* <track kind="subtitles" src="path/to/captions.vtt" srclang="en" label="English" /> */}
      </video>

      {/* Play/Pause overlay button (only visible when paused) */}
      {!isPlaying && showControls && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="rounded-full bg-black hover:bg-black text-black hover:text-white size-12"
          >
            <Play className="size-6 text-white fill-white" />
          </Button>
        </div>
      )}

      {/* Control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-black-40 p-2 rounded-b-xl transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div className="flex items-center mb-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="w-full"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Play/Pause button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className="rounded-full hover:bg-white/10 text-white hover:text-white size-10"
            >
              {isPlaying ? (
                <Pause className="size-5 fill-white" />
              ) : (
                <Play className="size-5  fill-white" />
              )}
            </Button>

            {/* Volume control */}
            <div className="flex items-center space-x-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="rounded-full hover:bg-white/10 text-white hover:text-white size-10"
              >
                {isMuted ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}
              </Button>
              <div className="w-24 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </div>
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
