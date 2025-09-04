"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play } from "lucide-react";

interface VideoThumbnailProps {
  videoUrl: string;
  title: string;
  duration?: number | null;
  thumbnailUrl?: string | null; // Add thumbnailUrl prop
  className?: string;
}

export function VideoThumbnail({
  videoUrl,
  title,
  duration,
  thumbnailUrl, // Destructure thumbnailUrl
  className = "",
}: VideoThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Extract file ID from Google Drive URLs for thumbnail generation
  const getGoogleDriveFileId = (url: string): string | null => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const isGoogleDrivePreview =
    videoUrl.includes("drive.google.com/file/d/") &&
    videoUrl.includes("/preview");
  const googleDriveFileId = isGoogleDrivePreview
    ? getGoogleDriveFileId(videoUrl)
    : null;

  useEffect(() => {
    // If we already have a thumbnail URL from the database, use it directly
    if (thumbnailUrl) {
      setGeneratedThumbnailUrl(thumbnailUrl);
      setIsLoading(false);
      return;
    }

    if (isGoogleDrivePreview && googleDriveFileId) {
      // Use Google Drive thumbnail API for preview URLs
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${googleDriveFileId}&sz=w400-h300`;
      setGeneratedThumbnailUrl(thumbnailUrl);
      setIsLoading(false);
      return;
    }

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
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setGeneratedThumbnailUrl(url);
                setIsLoading(false);
              } else {
                // Fallback: use video poster or default thumbnail
                setIsLoading(false);
              }
            },
            "image/jpeg",
            0.8
          );
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
      if (generatedThumbnailUrl) {
        URL.revokeObjectURL(generatedThumbnailUrl);
      }
    };
  }, [
    videoUrl,
    duration,
    isGoogleDrivePreview,
    googleDriveFileId,
    thumbnailUrl,
  ]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (generatedThumbnailUrl && !thumbnailUrl) {
        URL.revokeObjectURL(generatedThumbnailUrl);
      }
    };
  }, [generatedThumbnailUrl, thumbnailUrl]);

  return (
    <div
      className={`relative aspect-video rounded-2xl overflow-hidden group ${className}`}
    >
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
      ) : generatedThumbnailUrl ? (
        <>
          <Image
            src={generatedThumbnailUrl}
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
      ) : !isGoogleDrivePreview ? (
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
      ) : (
        <>
          {/* Fallback for Google Drive when thumbnail fails to load */}
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white relative">
            <Play className="h-12 w-12 mb-2 opacity-80" />
            <span className="text-sm font-medium opacity-90">
              Google Drive Video
            </span>
            <span className="text-xs opacity-70 mt-1 px-2 text-center">
              {title}
            </span>
          </div>

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
