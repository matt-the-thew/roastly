import type { NextConfig } from "next";
import path from "node:path";

console.log("WEBPACK CONFIG LOADED");

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 500, // 250–1000 is fine
      aggregateTimeout: 50, // keeps HMR snappy
      ignored: /node_modules/,
    };
    return config;
  },
};

export default nextConfig;
