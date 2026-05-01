import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /** Use the `platform/` app folder when a parent lockfile exists */
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/free-website",
        destination: "https://foxes.ai/lander.html",
        permanent: true,
      },
      {
        source: "/onboarding",
        destination: "https://foxes.ai/lander.html",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
