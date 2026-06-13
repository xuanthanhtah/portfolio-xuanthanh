import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly define the workspace root directory for Turbopack compilation
    root: __dirname,
  },
};

export default nextConfig;
