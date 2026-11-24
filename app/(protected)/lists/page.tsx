import { requireAuth, requireFeature } from "@/lib/session";
import { loadListsIndex, parseListsQuery } from "@/lib/game-lists/index-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ListsIndex } from "@/components/game-lists/lists-index";
import { PageHeader } from "@/components/templates/page-header";

// The Game Lists index: the club's lists, then members'. `?q=` finds lists
// by name or member, `?game=` the lists holding a game.
export default async function ListsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; game?: string | string[] }>;
}) {
  await requireAuth();
  const features = await requireFeature("game_lists");
  const { q, gameId } = parseListsQuery(await searchParams);
  const page = await loadListsIndex(q, gameId);
  const badge = features.preview("game_lists") && <PreviewBadge />;
  if (!page) {
    return (
      <PageHeader
        title="Lists"
        badge={badge}
        description="The Game Lists couldn't be loaded right now. Try again in a moment."
      />
    );
  }
  return <ListsIndex page={page} q={q} badge={badge} />;
}
