/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crema.b-cdn.net',
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
