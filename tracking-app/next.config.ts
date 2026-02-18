import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  compiler: {
    styledComponents: true,
  },
  output: "standalone",
  trailingSlash: false,
  generateEtags: false,
  poweredByHeader: false,
};

export default nextConfig;
