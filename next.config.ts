import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only. Keep local `next dev` unchanged
  // while the Actions build uses the project sub-path.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.GITHUB_ACTIONS === "true" ? "/space-impact-2" : "",
};

export default nextConfig;
