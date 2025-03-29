"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCheck, ArrowLeft, Loader, Link2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client-browser";

interface VideoData {
  id: string;
  video_url: string | null;
  created_at: string;
  title: string | null;
}

export default function VideoPreviewClient({ videoId }: { videoId: string }) {
  const router = useRouter();
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const supabase = createClient();

  // States
  const [isUploading, setIsUploading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [isTitleUpdating, setIsTitleUpdating] = useState(false);

  // Fetch video data from Supabase
  const fetchVideoData = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setVideoData(data);
        setTitle(data.title || "");

        // If video URL exists, set it
        if (data.video_url) {
          setVideoUrl(data.video_url);
        }
      } else {
        toast.error("Video not found");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("Could not load video data");
    } finally {
      setIsLoading(false);
    }
  };

  // Update video title in Supabase
  const updateVideoTitle = async (newTitle: string) => {
    if (!videoData || newTitle === videoData.title) return;

    setIsTitleUpdating(true);
    try {
      const { error } = await supabase
        .from("videos")
        .update({ title: newTitle })
        .eq("id", videoId);

      if (error) {
        throw error;
      }

      setVideoData({ ...videoData, title: newTitle });
      toast.success("Title updated successfully");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    } finally {
      setIsTitleUpdating(false);
    }
  };

  // Handle title input blur
  const handleTitleBlur = () => {
    updateVideoTitle(title);
  };

  // Check for recording data in sessionStorage (for the uploader's session)
  const checkForRecordingData = () => {
    const storedData = sessionStorage.getItem("recordingData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        // Convert base64 to blob if we have it
        if (parsedData.blobBase64) {
          const byteCharacters = atob(parsedData.blobBase64);
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }

          const blob = new Blob(byteArrays, { type: "video/webm" });

          // Start uploading if we have the blob
          uploadVideo(blob);
        }
      } catch (e) {
        console.error("Error processing stored recording data", e);
      }

      // Clear storage after handling
      sessionStorage.removeItem("recordingData");
    }
  };

  useEffect(() => {
    // First, fetch the video data
    fetchVideoData();

    // Then check if we have recording data to upload
    checkForRecordingData();

    // Poll for updates if we don't have a video URL yet
    const pollInterval = setInterval(() => {
      if (!videoUrl) {
        fetchVideoData();
      } else {
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [videoId]);

  const uploadVideo = async (blob: Blob) => {
    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append(
        "video",
        blob,
        `recording-${new Date().toISOString()}.webm`
      );

      // Upload to API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Update the video URL
      setVideoUrl(data.url);

      // Update Supabase with the video URL
      const { error } = await supabase
        .from("videos")
        .update({ video_url: data.url })
        .eq("id", videoId);

      if (error) {
        throw error;
      }

      toast.success("Recording uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload recording. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async () => {
    const shareUrl = `${window.location.origin}/preview/${videoId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      toast.success("Link copied to clipboard!");

      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const openInNewTab = () => {
    if (videoUrl) {
      window.open(videoUrl, "_blank");
    }
  };

  const goBackHome = () => {
    router.push("/");
  };

  return (
    <>
      {/* Header with Back Button and Title Input */}
      <div className="flex h-fit p-4 border-b items-center justify-between">
        <Button
          variant="ghost"
          className="flex size-10 [&_svg]:size-6"
          onClick={goBackHome}
        >
          <ArrowLeft />
        </Button>

        <div className="flex-1 mx-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Enter video title"
            className="max-w-md text-2xl font-bold w-full"
            disabled={isLoading || isTitleUpdating}
          />
        </div>

        <Button
          size="icon"
          onClick={copyToClipboard}
          disabled={isLoading}
          className="ml-2 rounded-full [&_svg]:size-5"
          title="Copy URL to clipboard"
        >
          {copySuccess ? <CheckCheck /> : <Link2 className="-rotate-45" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center bg-black">
        <div className="flex justify-center h-full items-center max-w-5xl">
          {/* Loading State */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col gap-2 items-center">
                <div className="size-fit text-white animate-spin">
                  <Loader />
                </div>
                <p className="text-background">Uploading...</p>
              </div>
            </div>
          )}

          {/* Preview Video */}
          {videoUrl && !isLoading && (
            <div className="flex h-full items-center justify-center border-red-500">
              <video
                ref={previewVideoRef}
                className="h-full object-contain"
                controls
                autoPlay
                src={videoUrl}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
