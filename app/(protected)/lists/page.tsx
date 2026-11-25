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
  const { q, gameId } = parseListsQuery(await searchParams);
  // The read doesn't need the session, so it starts alongside the gate
  // rather than after it.
  const [, features, page] = await Promise.all([
    requireAuth(),
    requireFeature("game_lists"),
    loadListsIndex(q, gameId),
  ]);
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
