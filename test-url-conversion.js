// Test URL conversion untuk Bunny CDN
// Copy fungsi getDirectVideoUrl langsung untuk testing
function getDirectVideoUrl(playerUrl) {
  try {
    // Check if it's a Bunny CDN iframe URL
    if (playerUrl.includes('iframe.mediadelivery.net/embed/')) {
      // Extract library ID and video ID from iframe URL
       // Video ID can contain hyphens and alphanumeric characters (UUID format)
        const match = playerUrl.match(/iframe\.mediadelivery\.net\/embed\/(\d+)\/([\w-]+)/);
       if (match) {
        const [, libraryId, videoId] = match;
        // Convert to direct stream URL using correct Bunny CDN format
        // Format: https://{pull_zone_url}.b-cdn.net/{video_id}/play_720p.mp4
        return `https://vz-${libraryId}.b-cdn.net/${videoId}/play_720p.mp4`;
      }
    }
    
    // Check if it's already a direct video URL
    if (playerUrl.includes('.b-cdn.net') && playerUrl.includes('.mp4')) {
      return playerUrl;
    }
    
    // For other URLs, return as-is (fallback)
    return playerUrl;
  } catch (error) {
    console.error('Error converting video URL:', error);
    return playerUrl;
  }
}

// Test dengan URL yang ada di database
const testUrl = 'https://iframe.mediadelivery.net/embed/123456/abcd1234-5678-90ef-ghij-klmnopqrstuv';

console.log('Original URL:', testUrl);
const convertedUrl = getDirectVideoUrl(testUrl);
console.log('Converted URL:', convertedUrl);

// Test apakah URL yang dikonversi mengikuti format yang benar
const expectedFormat = 'https://vz-123456.b-cdn.net/abcd1234-5678-90ef-ghij-klmnopqrstuv/play_720p.mp4';
console.log('Expected format:', expectedFormat);
console.log('Matches expected?', convertedUrl === expectedFormat);

// Test dengan URL yang sudah dalam format direct
const directUrl = 'https://vz-123456.b-cdn.net/abcd1234-5678-90ef-ghij-klmnopqrstuv/play_720p.mp4';
console.log('\nTesting direct URL:', directUrl);
const directResult = getDirectVideoUrl(directUrl);
console.log('Direct URL result:', directResult);
console.log('Direct URL unchanged?', directUrl === directResult);