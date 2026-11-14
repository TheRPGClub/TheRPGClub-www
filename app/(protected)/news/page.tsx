import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession, requireFeature } from "@/lib/session";
import { parseNewsFilters } from "@/lib/news";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { NewsBody } from "@/components/news/news-body";
import { NewsSkeleton } from "@/components/news/news-skeleton";

// The News Hub (spec api#355): the game news members post in the News
// Category threads on Discord, as a contact sheet. Newest first in UTC day
// bands, each a grid of cards marked in their News Category's ink, beside the
// category rail (a "Filter" disclosure below lg). The URL holds the chosen
// News Categories, the search and the page; the API applies them.

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Gate here, outside the Suspense boundary: a not-found streamed from
  // inside one would answer 200.
  const session = await getSession();
  if (!session) redirect("/");
  const features = await requireFeature("news_hub");
  const filters = parseNewsFilters(await searchParams);
  const badge = features.preview("news_hub") && <PreviewBadge />;

  return (
    <Suspense fallback={<NewsSkeleton badge={badge} />}>
      <NewsBody filters={filters} userId={session.principal.discord_id} badge={badge} />
    </Suspense>
  );
}
