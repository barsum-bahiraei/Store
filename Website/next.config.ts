import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // WordPress URLs end in a slash. Let the migration proxy handle them
  // directly so they do not create a 308 -> 301 redirect chain.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost", port: "7185", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "7185", pathname: "/**" },
    ],
  },
};

export default nextConfig;
