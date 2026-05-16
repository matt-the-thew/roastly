import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 500,
      aggregateTimeout: 50,
      ignored: /node_modules/,
    };
    return config;
  },
  turbopack: {},
  cacheComponents: true,
};

export default nextConfig;
