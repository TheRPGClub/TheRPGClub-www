import { apiFetch } from "@/lib/api";
import { FEED_PER_PAGE, type FeedQuery, type ReviewFeedEntry } from "@/lib/reviews/feed";
import type { CollectionMeta } from "./types";

// The Review Feed's reads (GET /api/v1/reviews, the Latest Reviews panel's
// list too). Fresh each time: a review published a moment ago belongs on it.

export interface ReviewFeedPage {
  entries: ReviewFeedEntry[];
  meta: Partial<CollectionMeta> | null;
}

// One page of the feed; "not_found" when the reviews Feature closed after
// the page's gate ran, null when the read failed.
export async function fetchReviewFeed(query: FeedQuery): Promise<ReviewFeedPage | "not_found" | null> {
  return readFeed(query, query.page, FEED_PER_PAGE);
}

// The entries just past the page's two edges (each one entry read on its
// own, `per=1`, whose page number is its position): the last of the page
// before (null on page one) and the first of the page after (null past the
// end), so a day band at an edge knows whether its day runs over the break.
// Undefined when that read failed.
export async function fetchReviewFeedNeighbours(
  query: FeedQuery,
): Promise<{ before: ReviewFeedEntry | null | undefined; after: ReviewFeedEntry | null | undefined }> {
  const at = async (position: number) => {
    if (position < 1) return null;
    const page = await readFeed(query, position, 1);
    return page && page !== "not_found" ? (page.entries[0] ?? null) : undefined;
  };
  const [before, after] = await Promise.all([
    at((query.page - 1) * FEED_PER_PAGE),
    at(query.page * FEED_PER_PAGE + 1),
  ]);
  return { before, after };
}

async function readFeed(
  query: FeedQuery,
  page: number,
  per: number,
): Promise<ReviewFeedPage | "not_found" | null> {
  const ps = new URLSearchParams({ page: String(page), per: String(per) });
  if (query.written) ps.set("written", "1");
  try {
    const res = await apiFetch(`/api/v1/reviews?${ps}`, { cache: "no-store" });
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: ReviewFeedEntry[]; meta?: CollectionMeta };
    return { entries: body.data ?? [], meta: body.meta ?? null };
  } catch {
    return null;
  }
}
