"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play } from "lucide-react";

interface VideoThumbnailProps {
  videoUrl: string;
  title: string;
  duration?: number | null;
  className?: string;
}

export function VideoThumbnail({
  videoUrl,
  title,
  duration,
  className = "",
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const generateThumbnail = () => {
      try {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw the current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to blob URL
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setThumbnailUrl(url);
              setIsLoading(false);
            } else {
              // Fallback: use video poster or default thumbnail
              setIsLoading(false);
            }
          }, "image/jpeg", 0.8);
        }
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        // Fallback: use video element directly as thumbnail
        setIsLoading(false);
      }
    };

    const handleLoadedData = () => {
      // Seek to 1 second or 10% of video duration for better thumbnail
      const seekTime = duration ? Math.min(1, duration * 0.1) : 1;
      video.currentTime = seekTime;
    };

    const handleSeeked = () => {
      generateThumbnail();
    };

    const handleError = () => {
      console.error("Error loading video for thumbnail");
      setIsLoading(false);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);

    // Set video source with CORS handling
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.load();

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      
      // Clean up blob URL
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [videoUrl, duration]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  return (
    <div className={`relative aspect-video rounded-2xl overflow-hidden group ${className}`}>
      {/* Hidden video element for thumbnail generation */}
      <video
        ref={videoRef}
        className="hidden"
        muted
        playsInline
        preload="metadata"
      />
      
      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Thumbnail display */}
      {isLoading ? (
        <div className="w-full h-full bg-muted-foreground animate-pulse flex items-center justify-center">
          <div className="text-muted text-sm">Loading...</div>
        </div>
      ) : thumbnailUrl ? (
        <>
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            className="w-full h-full object-cover"
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-3">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          
          {/* Duration badge */}
          {duration && duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Fallback: Show video element as thumbnail */}
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
            onLoadedData={(e) => {
              const video = e.target as HTMLVideoElement;
              video.currentTime = duration ? Math.min(1, duration * 0.1) : 1;
            }}
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-3">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          
          {/* Duration badge */}
          {duration && duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </>
      )}
    </div>
  );
}