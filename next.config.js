/** @type {import('next').NextConfig} */
const nextConfig = {
  // API configuration for large file uploads
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Increase body size limits for video uploads
  api: {
    bodyParser: {
      sizeLimit: "200mb", // Must match UPLOAD_CONFIG.MAX_FILE_SIZE_MB in lib/chunked-upload.ts
    },
    responseLimit: "200mb", // Must match UPLOAD_CONFIG.MAX_FILE_SIZE_MB in lib/chunked-upload.ts
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "screenbolt.b-cdn.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "storage.bunnycdn.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "video.bunnycdn.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
