import type { NextConfig } from "next";

const REPO_NAME = "Blurmatix";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Disable strict mode — prevents Framer Motion animation issues in dev
  // (double-invocation in StrictMode causes opacity:0 animations to get stuck)
  reactStrictMode: false,

  // Static export only during production build (for GitHub Pages)
  // In dev mode, keep normal Next.js server so hot-reload works
  ...(isProd && { output: "export" }),

  basePath: isProd ? `/${REPO_NAME}` : "",
  assetPrefix: isProd ? `/${REPO_NAME}/` : "",

  images: {
    unoptimized: true,
  },

  trailingSlash: true,
};

export default nextConfig;
