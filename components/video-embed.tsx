'use client';

import { useState, useEffect } from 'react';
import { Source } from '@/lib/generated/prisma';

interface VideoEmbedProps {
  videoUrl: string;
  source?: Source;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

interface BunnyEmbedConfig {
  autoplay?: boolean;
  muted?: boolean;
  preload?: boolean;
  loop?: boolean;
  showSpeed?: boolean;
  showHeatmap?: boolean;
  t?: string; // Start time
}

interface DropboxEmbedConfig {
  height?: string;
  width?: string;
}

export function VideoEmbed({
  videoUrl,
  source,
  title,
  className = '',
  autoPlay = false,
  muted = false,
  controls = true,
}: VideoEmbedProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [embedType, setEmbedType] = useState<'bunny' | 'direct' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    try {
      const url = new URL(videoUrl);
      
      // Detect Bunny Stream URLs
      if (url.hostname.includes('iframe.mediadelivery.net') || 
          url.hostname.includes('b-cdn.net') ||
          source === 'Bunny') {
        handleBunnyEmbed(videoUrl);
      }
      // Detect Dropbox URLs
      else if (url.hostname.includes('dropbox.com') || 
               url.hostname.includes('dropboxusercontent.com') ||
               source === 'Dropbox') {
        handleDropboxEmbed(videoUrl);
      }
      // Direct video URLs
      else if (videoUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
        setEmbedType('direct');
        setEmbedUrl(videoUrl);
        setIsLoading(false);
      }
      // Unknown format
      else {
        setEmbedType('unknown');
        setEmbedUrl(videoUrl);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error processing video URL:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [videoUrl, source, autoPlay, muted]);

  const handleBunnyEmbed = (url: string) => {
    try {
      let finalUrl = url;
      
      // If it's already an iframe embed URL, use it directly
      if (url.includes('iframe.mediadelivery.net/embed/')) {
        finalUrl = url;
      }
      // If it's a direct CDN URL, convert to embed URL
      else if (url.includes('.b-cdn.net')) {
        // Extract library ID and video ID from CDN URL
        // Format: https://vz-{libraryId}.b-cdn.net/{videoId}/play_720p.mp4
        const cdnMatch = url.match(/vz-(\d+)\.b-cdn\.net\/([a-f0-9-]{36})/);
        if (cdnMatch) {
          const [, libraryId, videoId] = cdnMatch;
          finalUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
        } else {
          // If regex doesn't match, fallback to direct video
          console.warn('Could not parse Bunny CDN URL, using direct video:', url);
          setEmbedType('direct');
          setEmbedUrl(url);
          setIsLoading(false);
          return;
        }
      }
      // If it's some other Bunny format, try to use as embed
      else {
        finalUrl = url;
      }
      
      // Add query parameters for Bunny embed
      const embedUrl = new URL(finalUrl);
      const config: BunnyEmbedConfig = {
        autoplay: autoPlay,
        muted: muted,
        preload: true,
        loop: false,
        showSpeed: true,
        showHeatmap: false,
      };
      
      Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
          embedUrl.searchParams.set(key, value.toString());
        }
      });
      
      setEmbedType('bunny');
      setEmbedUrl(embedUrl.toString());
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing Bunny URL:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleDropboxEmbed = (url: string) => {
    try {
      // Dropbox URLs with ?raw=1 parameter can be used directly with HTML video tag
      // No need for Dropbox Embedder, treat as direct video
      setEmbedType('direct');
      setEmbedUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing Dropbox URL:', error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    console.error('Failed to load video embed:', embedUrl);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Video tidak dapat dimuat
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {title || 'Video'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading video...</p>
          </div>
        </div>
      )}
      
      {/* Bunny Stream Embed */}
      {embedType === 'bunny' && (
        <div className="relative" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={embedUrl}
            loading="lazy"
            style={{
              border: 'none',
              position: 'absolute',
              top: 0,
              height: '100%',
              width: '100%',
            }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
            title={title || 'Bunny Stream Video'}
          />
        </div>
      )}
      
      {/* Dropbox videos now use direct video embed with ?raw=1 parameter */}
      
      {/* Direct Video Embed */}
      {embedType === 'direct' && (
        <video
          className={`w-full h-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          preload="metadata"
          onLoadStart={handleLoadStart}
          onCanPlay={handleLoad}
          onError={handleError}
          aria-label={title || 'Video player'}
        >
          {/* Detect video format from URL and set appropriate type */}
          {embedUrl.includes('.webm') ? (
            <source src={embedUrl} type="video/webm" />
          ) : embedUrl.includes('.mp4') ? (
            <source src={embedUrl} type="video/mp4" />
          ) : (
            // Fallback: try both formats
            <>
              <source src={embedUrl} type="video/webm" />
              <source src={embedUrl} type="video/mp4" />
            </>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your browser does not support the video tag.
          </p>
        </video>
      )}
      
      {/* Unknown Format Fallback */}
      {embedType === 'unknown' && (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Format video tidak didukung
            </p>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm underline"
            >
              Buka video di tab baru
            </a>
          </div>
        </div>
      )}
    </div>
  );
}