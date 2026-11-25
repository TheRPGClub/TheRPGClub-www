import type { Game } from "@/lib/api/types";
import type { ShelfShown } from "@/lib/games/shelf";
import { fetchGameShelf } from "@/lib/games/shelf-read";
import { readGamePlaytime } from "@/lib/playtime/read";
import { Skeleton } from "@/components/ui/skeleton";
import { ShelfActions } from "./shelf-actions";

// The hero's list control for a signed-in member (spec api#451, 1A): reads
// where their lists stand on this game, and their Playtime for it (spec
// api#457, 2D+F), streamed in its own Suspense so the art and title never
// wait on it.
export async function GameShelfControl({ game, userId, shown }: { game: Game; userId: string; shown: ShelfShown }) {
  const [{ shelf, platforms }, playtime] = await Promise.all([fetchGameShelf(game, userId, shown), readGamePlaytime(userId, game.game_id)]);
  return (
    <ShelfActions
      userId={userId}
      game={{ game_id: game.game_id, title: game.title, cover_url: game.cover_url }}
      shelf={shelf}
      shown={shown}
      platforms={platforms}
      playtime={playtime}
    />
  );
}

export function GameShelfControlSkeleton() {
  return (
    <div className="col-span-full flex flex-wrap gap-2 md:mt-4.5">
      <Skeleton variant="control" className="h-9 w-52 max-md:w-full" />
      <Skeleton variant="control" className="h-9 w-44" />
      <Skeleton variant="control" className="h-7 w-36 self-center max-md:hidden" />
    </div>
  );
}
