import type { Game } from "@/lib/api/types";
import type { FeatureView } from "@/lib/features";
import {
  countStats,
  countsOf,
  shownCounts,
  statLabel,
} from "@/lib/api/game-counts";
import { formatReleaseDate } from "@/lib/games/game-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { GameHero } from "@/components/issue/game-hero";

// The game page's hero: the cover story with the club's numbers (only the
// counts of Features this viewer is shown) and the release date.
export function GamePageHero({
  game,
  reviewTotal,
  features,
}: {
  game: Game;
  // Null when Reviews aren't shown or couldn't be read.
  reviewTotal: number | null;
  features: FeatureView;
}) {
  const stats = countStats(
    shownCounts(countsOf(game, reviewTotal), features),
  ).map((stat) => ({ label: statLabel(stat, "hero"), value: stat.value }));

  return (
    <GameHero
      game={game}
      stats={stats}
      releaseDate={
        game.initial_release_date
          ? formatReleaseDate(game.initial_release_date, "short")
          : null
      }
      badge={features.preview("game_index") && <PreviewBadge />}
    />
  );
}
