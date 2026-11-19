"use client";

import { useNewsStamp } from "@/hooks/use-news-stamp";

// Brings in News Items posted while the page is open, by following the News
// Feed Stamp. Only page one follows the feed: new items land at its top,
// while on a later page they would shift every card under the reader.

export function NewsLiveRefresh({ stamp, page }: { stamp: string | null; page: number }) {
  useNewsStamp(stamp, page === 1);
  return null;
}
