/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
};

module.exports = nextConfig;
