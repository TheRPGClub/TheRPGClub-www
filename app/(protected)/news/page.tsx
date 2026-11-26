import { Suspense } from "react";
import { requireAuth, requireFeature } from "@/lib/session";
import { parseNewsFilters } from "@/lib/news";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { NewsBody } from "@/components/news/news-body";
import { NewsSkeleton } from "@/components/news/news-skeleton";

// The News Hub (spec api#355): the game news members post in the News
// Category threads on Discord. This is Catch-up (spec api#494, ticket
// www#221): what is new since the member's News Mark as a hero and a mosaic,
// then the Seen rows. The URL holds the chosen News Categories, the search,
// the page, and `since` for Show all; the API applies them.

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Gate here, outside the Suspense boundary: a not-found streamed from
  // inside one would answer 200.
  const session = await requireAuth();
  const features = await requireFeature("news_hub");
  const filters = parseNewsFilters(await searchParams);
  const badge = features.preview("news_hub") && <PreviewBadge />;

  return (
    <Suspense fallback={<NewsSkeleton badge={badge} />}>
      <NewsBody filters={filters} userId={session.principal.discord_id} badge={badge} />
    </Suspense>
  );
}
