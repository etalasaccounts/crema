'use client';

import { getDirectVideoUrl } from '@/lib/video-utils';
import { useState } from 'react';

interface DirectVideoEmbedProps {
  videoUrl: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
}

export function DirectVideoEmbed({
  videoUrl,
  title,
  className = '',
  autoPlay = false,
  controls = true,
  muted = false,
}: DirectVideoEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert to direct video URL
  const directUrl = getDirectVideoUrl(videoUrl);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    console.error('Failed to load video:', directUrl);
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
      
      <video
        className={`w-full h-full rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        preload="metadata"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        aria-label={title || 'Video player'}
      >
        <source src={directUrl} type="video/mp4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your browser does not support the video tag.
        </p>
      </video>
    </div>
  );
}