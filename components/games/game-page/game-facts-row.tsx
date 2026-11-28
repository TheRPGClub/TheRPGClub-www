import type { Game } from "@/lib/api/types";
import { fetchGameRelations, fetchGameReleases } from "@/lib/games/game-page";
import { cn } from "@/lib/utils";
import { AlternateVersions } from "@/components/games/game-page/alternate-versions";
import { GameDetails } from "@/components/games/game-page/game-details";
import { GameReleases } from "@/components/games/game-page/game-releases";

// The row under the hero: Releases, Details and (only when the game has
// some) Alternate Versions side by side from `lg`, stacked below it.
export async function GameFactsRow({
  game,
  calendarShown,
}: {
  game: Game;
  calendarShown: boolean;
}) {
  const [releases, relations] = await Promise.all([
    fetchGameReleases(game.game_id),
    fetchGameRelations(game.game_id),
  ]);
  const alternates = relations?.alternates ?? [];

  return (
    <div
      data-slot="game-facts-row"
      className={cn(
        "mt-6.5 grid items-start gap-6 md:grid-cols-2 lg:gap-8",
        alternates.length > 0
          ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.95fr)]"
          : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]",
      )}
    >
      <GameReleases
        releases={releases}
        firstReleased={game.initial_release_date}
        calendarShown={calendarShown}
      />
      <GameDetails relations={relations} />
      <AlternateVersions alternates={alternates} />
    </div>
  );
}
