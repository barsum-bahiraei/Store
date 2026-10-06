import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost", port: "7185", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "7185", pathname: "/**" },
      { protocol: "https", hostname: "zaryvan.com", pathname: "/wp-content/uploads/**" },
    ],
  },
};

export default nextConfig;
