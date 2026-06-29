import type { NextConfig } from "next";

// Repository name on GitHub — must match exactly (case-sensitive)
// https://farrelberwyn.github.io/FotoBloorth/
const REPO_NAME = "FotoBloorth";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static export — pure HTML/CSS/JS, no Node server needed
  output: "export",

  // GitHub Pages serves from /REPO_NAME/ — these must always be set
  basePath: `/${REPO_NAME}`,
  assetPrefix: `/${REPO_NAME}/`,

  // Image optimization not supported in static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for GitHub Pages directory routing
  trailingSlash: true,
};

export default nextConfig;
