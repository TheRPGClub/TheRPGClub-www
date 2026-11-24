import type { Game } from "@/lib/api/types";
import type { ShelfShown } from "@/lib/games/shelf";
import { fetchGameShelf } from "@/lib/games/shelf-read";
import { Skeleton } from "@/components/ui/skeleton";
import { ShelfActions } from "./shelf-actions";

// The hero's list control for a signed-in member (spec api#451, 1A): reads
// where their lists stand on this game, streamed in its own Suspense so the
// art and title never wait on it.
export async function GameShelfControl({ game, userId, shown }: { game: Game; userId: string; shown: ShelfShown }) {
  const { shelf, platforms } = await fetchGameShelf(game, userId, shown);
  return (
    <ShelfActions
      userId={userId}
      game={{ game_id: game.game_id, title: game.title, cover_url: game.cover_url }}
      shelf={shelf}
      shown={shown}
      platforms={platforms}
    />
  );
}

export function GameShelfControlSkeleton() {
  return (
    <div className="col-span-full flex flex-wrap gap-2 md:mt-4.5">
      <Skeleton variant="control" className="h-9 w-52 max-md:w-full" />
      <Skeleton variant="control" className="h-7 w-36 self-center max-md:hidden" />
    </div>
  );
}
