import type { NextConfig } from "next";

// Repository name — used for GitHub Pages deployment
const REPO_NAME = "Blurmatix";

// Only apply basePath/assetPrefix during production build (GitHub Actions sets NODE_ENV=production)
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static export for GitHub Pages
  output: "export",

  // basePath only in production so local dev works at http://localhost:3000
  basePath: isProd ? `/${REPO_NAME}` : "",
  assetPrefix: isProd ? `/${REPO_NAME}/` : "",

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
};

export default nextConfig;
