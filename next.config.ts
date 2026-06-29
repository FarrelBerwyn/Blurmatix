import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Ganti "foto-kita-blur" dengan nama repository GitHub kamu
// Contoh: repo kamu adalah github.com/username/foto-kita-blur → "/foto-kita-blur"
// Kalau pakai custom domain / GitHub Pages root → set ke ""
const REPO_NAME = process.env.NEXT_PUBLIC_BASE_PATH ?? "FotoBloorth";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static export — generate pure HTML/CSS/JS, no server needed
  output: "export",

  // Required for GitHub Pages subdirectory deployment
  // e.g. https://username.github.io/foto-kita-blur/
  basePath: isProd && REPO_NAME ? `/${REPO_NAME}` : "",
  assetPrefix: isProd && REPO_NAME ? `/${REPO_NAME}/` : "",

  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // Trailing slash for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
