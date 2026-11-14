import { Suspense } from "react";
import type { Game } from "@/lib/api/types";
import { uniqueUsers } from "@/lib/api/game-counts";
import type { GamePageGates, GamePageShow } from "@/lib/games/game-page";
import { cn } from "@/lib/utils";
import { GameImageUploadForm } from "@/components/game-image-upload-form";
import { GameHltb, GameHltbSkeleton } from "@/components/issue/game-hltb";
import { RailHeading, RailMembers } from "@/components/issue/game-rail";
import { GameThreads } from "@/components/game-links/game-threads";
import { GameDetails } from "@/components/games/game-page/game-details";
import { RailDetailsSkeleton } from "@/components/games/game-page/game-page-skeleton";

// The game page's rail, "About this game": its HowLongToBeat times, who's
// playing it, who finished it, the facts, its Discord threads, and the
// admins' image upload. Beside the Reviews it stacks; without them its
// sections lay out across the page instead of hugging one edge.
export function GameAboutRail({
  gameId,
  game,
  show,
  gates,
}: {
  gameId: number;
  game: Game;
  show: GamePageShow;
  gates: GamePageGates;
}) {
  return (
    <aside
      aria-label="About this game"
      className={cn(
        show.reviews
          ? "space-y-6.5"
          : "grid items-start gap-x-8 gap-y-6.5 sm:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {/* Saved HowLongToBeat times, or the lookup. Never scrapes on view. */}
      <Suspense fallback={<GameHltbSkeleton />}>
        <GameHltb
          gameId={gameId}
          title={game.title}
          releaseDate={game.initial_release_date}
        />
      </Suspense>
      {show.playing && (
        <RailMembers
          title="Playing now"
          users={uniqueUsers(game.now_playing ?? [])}
          empty="No one is playing this right now."
        />
      )}
      {show.completed && (
        <RailMembers
          title="Completed by"
          users={uniqueUsers(game.completions ?? [])}
          empty="No one has finished it yet."
        />
      )}
      <Suspense fallback={<RailDetailsSkeleton />}>
        <GameDetails
          gameId={gameId}
          releaseDate={game.initial_release_date}
          canRefreshReleases={gates.canRefreshReleases}
        />
      </Suspense>
      <Suspense fallback={null}>
        <GameThreads gameId={gameId} canEdit={gates.canEditThreads} />
      </Suspense>
      {gates.isAdmin && (
        <section>
          <RailHeading title="Images" count="Admin" />
          <p className="mb-3 text-[0.82rem] text-faint-foreground">
            Upload a cover, key art or logo for this game.
          </p>
          <GameImageUploadForm gameId={gameId} />
        </section>
      )}
    </aside>
  );
}
