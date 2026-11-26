import type { MetadataRoute } from "next";

// Crawlers may read the public pages and nothing else (spec api#518); every
// other page is for Members. Deny by default, like proxy.ts, so a new
// Member page is never opened to crawlers by accident. "/$" is the front
// page alone: a bare "/" would allow the whole site. The Share Card image is
// allowed too, so crawlers that honour robots.txt (X's) can still fetch the
// link preview, and so are the files a crawler needs to render the public
// pages: Next's assets, the favicon, icons, manifest and logo. No sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/$",
        "/join",
        "/codex/history",
        "/patch-notes",
        "/share-card",
        "/_next/",
        "/favicon.ico",
        "/icon",
        "/apple-icon",
        "/manifest.webmanifest",
        "/web-app-manifest-",
        "/logo.png",
      ],
      disallow: "/",
    },
  };
}
