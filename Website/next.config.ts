import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost", port: "7185", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "7185", pathname: "/**" },
    ],
  },
};

export default nextConfig;
