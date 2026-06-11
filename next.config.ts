import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  allowedDevOrigins: ["http://192.168.10.103:3000", "http://localhost:3000"],
  turbopack: {},
};

export default nextConfig;
