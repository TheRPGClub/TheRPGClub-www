import type { NextConfig } from "next";

const SHARP_LIBVIPS = ["./node_modules/@img/sharp-libvips-linux-x64/lib/**/*"];

const nextConfig: NextConfig = {
  // sharp's native binary dlopens libvips, which the file tracer can't see,
  // so the achievement tint (lib/achievements/tint.ts) shipped without it.
  outputFileTracingIncludes: {
    "/games/*": SHARP_LIBVIPS,
    "/members/*/achievements{,/**}": SHARP_LIBVIPS,
    // The Share Card image reads the default Theme's font files and the
    // logo from disk, and converts covers with sharp.
    "/share-card": [
      ...SHARP_LIBVIPS,
      "./themes/monthly-issue/share-card-fonts/*.ttf",
      "./public/logo.png",
    ],
  },
  experimental: {
    serverActions: {
      // The collection CSV import (2 MB) and the live event image (4 MB)
      // upload through server actions; this is the larger, plus room for the
      // multipart overhead. Vercel caps a function body at about 4.5 MB, so
      // a larger limit here would only move the refusal to the platform.
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
};

export default nextConfig;
