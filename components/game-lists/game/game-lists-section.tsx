import { loadGameListsSection } from "@/lib/game-lists/game-section";
import { GameListsDepartment } from "@/components/game-lists/game/game-lists-department";

// The game page's In Game Lists, below Reviews (pick 5C). Streams in on its
// own; when the lists can't be read the section stays out of the way.
export async function GameListsSection({ gameId, gameTitle, viewerId }: { gameId: number; gameTitle: string; viewerId: string | null }) {
  const data = await loadGameListsSection(gameId, viewerId);
  if (!data) return null;
  return <GameListsDepartment gameId={gameId} gameTitle={gameTitle} data={data} />;
}
