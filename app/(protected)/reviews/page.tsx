import { requireAuth, requireFeature } from "@/lib/session";
import type { RawSearchParams } from "@/lib/search-params";
import { parseFeedQuery } from "@/lib/reviews/feed";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ReviewFeed } from "@/components/reviews/feed/review-feed";

// The Review Feed (spec api#430): every member's Published Reviews and
// Revisions, newest published first, as ruled Review Boxes two-up in UTC day
// bands. The address holds the page and Written only; the API applies them.

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAuth();
  const features = await requireFeature("reviews");
  const query = parseFeedQuery(await searchParams);

  return (
    <ReviewFeed
      query={query}
      badge={features.preview("reviews") && <PreviewBadge />}
      // The compact Your drafts row goes in `drafts` (www#151).
    />
  );
}
