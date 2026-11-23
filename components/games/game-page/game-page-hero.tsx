import { Pencil } from "lucide-react";
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
import { ButtonLink } from "@/components/ui/button";

// The game page's hero: the cover story with the club's numbers (only the
// counts of Features this viewer is shown) and the release date.
export function GamePageHero({
  game,
  reviewTotal,
  features,
  canEdit,
}: {
  game: Game;
  // Null when Reviews aren't shown or couldn't be read.
  reviewTotal: number | null;
  features: FeatureView;
  // The viewer may open the Game Edit page (Admins, Regulars and staff).
  canEdit: boolean;
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
      action={
        canEdit && (
          <ButtonLink href={`/games/${game.game_id}/edit`} variant="overlay">
            <Pencil aria-hidden />
            Edit game
          </ButtonLink>
        )
      }
    />
  );
}
