import { Suspense } from "react";
import { requireAuth, requireFeature } from "@/lib/session";
import type { RawSearchParams } from "@/lib/search-params";
import { parseFeedQuery } from "@/lib/reviews/feed";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ReviewFeed } from "@/components/reviews/feed/review-feed";
import { ViewerDraftsRow } from "@/components/reviews/drafts/viewer-drafts-row";

// The Review Feed (spec api#430): every member's Published Reviews and
// Revisions, newest published first, as ruled Review Boxes two-up in UTC day
// bands. The address holds the page and Written only; the API applies them.

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("reviews");
  const query = parseFeedQuery(await searchParams);

  return (
    <ReviewFeed
      query={query}
      badge={features.preview("reviews") && <PreviewBadge />}
      // The viewer's own compact drafts row; nothing with no Drafts.
      drafts={
        <Suspense fallback={null}>
          <ViewerDraftsRow viewerId={session.principal.discord_id} />
        </Suspense>
      }
    />
  );
}
