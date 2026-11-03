import type { NextConfig } from "next";

const SHARP_LIBVIPS = ["./node_modules/@img/sharp-libvips-linux-x64/lib/**/*"];

const nextConfig: NextConfig = {
  // sharp's native binary dlopens libvips, which the file tracer can't see,
  // so the achievement tint (lib/achievements/tint.ts) shipped without it.
  outputFileTracingIncludes: {
    "/achievements": SHARP_LIBVIPS,
    "/games/*": SHARP_LIBVIPS,
    "/members/*/achievements{,/**}": SHARP_LIBVIPS,
  },
  experimental: {
    serverActions: {
      // The collection CSV import (2 MB) and the live event image (10 MB)
      // upload through server actions; this is the larger, plus room for the
      // multipart overhead.
      bodySizeLimit: "11mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
    ],
  },
};

export default nextConfig;
