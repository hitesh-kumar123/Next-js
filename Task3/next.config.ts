import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // @ts-ignore
  allowedDevOrigins: ['192.168.1.10', 'localhost:3000'],
};

export default nextConfig;
