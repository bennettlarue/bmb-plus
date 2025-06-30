import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    domains: ["picsum.photos", "images.ctfassets.net"],
  },
};

export default nextConfig;
