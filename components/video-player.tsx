"use client"

import { useState, useEffect } from "react"

interface VideoPlayerProps {
  videoUrl?: string | null
  className?: string
}

export default function VideoPlayer({ videoUrl, className = "" }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  // Process the video URL to ensure it's properly formatted for playback
  useEffect(() => {
    if (!videoUrl) {
      setError("No video URL provided")
      setIsLoading(false)
      return
    }

    try {
      // Validate URL format
      const url = new URL(videoUrl)
      
      // Ensure Dropbox URLs are properly formatted for direct playback
      if (url.hostname.includes("dropbox.com")) {
        // For Dropbox shared links, ensure they have the correct parameters
        if (url.hostname === "www.dropbox.com") {
          // Convert www.dropbox.com links to dl.dropboxusercontent.com for direct access
          if (url.pathname.startsWith("/s/")) {
            // Old style links
            url.searchParams.set("dl", "1")
          } else if (url.pathname.startsWith("/scl/")) {
            // New style links
            url.searchParams.set("raw", "1")
          }
        }
        
        setProcessedUrl(url.toString())
      } else {
        // For other URLs, use as-is
        setProcessedUrl(videoUrl)
      }
      
      setError(null)
    } catch (e) {
      setError("Invalid video URL provided")
      console.error("Video URL processing error:", e)
      setProcessedUrl(null)
    }
  }, [videoUrl])

  const handleLoadStart = () => {
    setIsLoading(true)
    setError(null)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const handleError = (e: any) => {
    setIsLoading(false)
    setError("Failed to load video. The file may not exist or is not accessible.")
    console.log("[v0] Video error:", e)
  }

  // Show error if no URL is provided
  if (!videoUrl) {
    return (
      <div className={`w-full max-w-3xl mx-auto ${className}`}>
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg aspect-video flex items-center justify-center">
          <div className="text-red-400 text-center p-4">
            <p>No video URL provided</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
        {isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-white">Loading video...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-red-400 text-center p-4">
              <p>{error}</p>
              {processedUrl && (
                <p className="text-sm mt-2">Video URL: {processedUrl}</p>
              )}
            </div>
          </div>
        )}

        {processedUrl && (
          <video
            className="w-full h-auto"
            controls
            preload="metadata"
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onError={handleError}
          >
            <source src={processedUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="mt-4 text-center text-muted-foreground">
        <p className="text-sm">WebM Video Player</p>
      </div>
    </div>
  )
}