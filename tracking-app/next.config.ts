import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
