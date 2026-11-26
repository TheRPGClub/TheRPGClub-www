import type { MetadataRoute } from "next";

// Crawlers may read the public pages and nothing else (spec api#518); every
// other page is for Members. "/$" is the front page alone: a bare "/" would
// allow the whole site. The Share Card image is allowed too, so crawlers
// that honour robots.txt (X's) can still fetch the link preview. No sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/$", "/join", "/codex/history", "/share-card"],
      disallow: "/",
    },
  };
}
