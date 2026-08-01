import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Bundles only the traced server deps into .next/standalone — required for a
  // container image that doesn't ship all of node_modules.
  output: "standalone",
  // Pin the workspace root — a lockfile in the home directory otherwise wins inference.
  turbopack: {
    root: path.join(__dirname),
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "motojobs.in",
        "www.motojobs.in",
      ],
    },
  },
  images: {
    // No `hostname: "**"` — a wildcard turns the optimizer into an open proxy
    // that will fetch any URL an attacker puts in the query string.
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "cdn.worldvectorlogo.com" },
      { protocol: "https", hostname: "static.vecteezy.com" },
    ],
  },
};

export default nextConfig;
