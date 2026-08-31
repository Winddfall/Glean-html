import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const repository = "Glean-html";
const basePath = isProduction ? `/${repository}` : "";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only; `next build` writes them to `out/`.
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
