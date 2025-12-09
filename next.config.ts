import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: 0,
  },

  // 👇 THIS FIXES THE BUILD ERROR
  middleware: false,
};

export default nextConfig;
