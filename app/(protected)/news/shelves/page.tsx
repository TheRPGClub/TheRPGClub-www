import { Suspense } from "react";
import { parseNewsFilters } from "@/lib/news";
import { requireAuth, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { NewsShelvesBody } from "@/components/news/shelves/news-shelves-body";
import { NewsShelvesSkeleton } from "@/components/news/shelves/news-shelves-skeleton";

// The News Hub's Shelves tab (spec api#494, ticket www#223): the three
// newest News Items in the member's default view as a lead row, then one
// sideways shelf per News Category they follow. Always the default view:
// choosing categories or searching goes to Catch-up.

export default async function NewsShelvesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Gate here, outside the Suspense boundary: a not-found streamed from
  // inside one would answer 200.
  const session = await requireAuth();
  const features = await requireFeature("news_hub");
  const badge = features.preview("news_hub") && <PreviewBadge />;
  // The visit's mark rides along, so going back to Catch-up stays one visit.
  const { mark } = parseNewsFilters(await searchParams);

  return (
    <Suspense fallback={<NewsShelvesSkeleton badge={badge} />}>
      <NewsShelvesBody userId={session.principal.discord_id} mark={mark} badge={badge} />
    </Suspense>
  );
}
