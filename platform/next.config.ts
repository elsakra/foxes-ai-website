import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /** Use the `platform/` app folder when a parent lockfile exists */
    root: process.cwd(),
  },
};

export default nextConfig;
