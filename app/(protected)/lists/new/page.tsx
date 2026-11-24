import { requireAuth, requireFeature } from "@/lib/session";
import { fetchGameSummary } from "@/lib/game-lists/api";
import { parseListsQuery } from "@/lib/game-lists/index-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { NewListForm } from "@/components/game-lists/new/new-list-form";

// A new Game List. `?game=` arrives from a game page with that game picked.
export default async function NewGameListPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string | string[] }>;
}) {
  await requireAuth();
  const features = await requireFeature("game_lists");
  const { gameId } = parseListsQuery(await searchParams);
  const game = gameId ? await fetchGameSummary(gameId) : null;
  return <NewListForm initialPicks={game ? [game] : []} badge={features.preview("game_lists") && <PreviewBadge />} />;
}
