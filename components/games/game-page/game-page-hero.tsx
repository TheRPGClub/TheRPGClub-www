import { Suspense } from "react";
import { Pencil } from "lucide-react";
import type { Game } from "@/lib/api/types";
import type { FeatureView } from "@/lib/features";
import type { GamePageShow } from "@/lib/games/game-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { GameHero } from "@/components/issue/game-hero";
import { ButtonLink } from "@/components/ui/button";
import { GameHeroPanel, GameHeroPanelSkeleton } from "@/components/games/game-page/game-hero-panel";
import { GameShelfControl, GameShelfControlSkeleton } from "@/components/games/game-page/shelf/game-shelf-control";

// The game page's hero: the cover story, Edit game for those who may open the
// Game Edit page, the member's list control under the blurb, and the club's panel over its foot (streamed in its own
// Suspense, so the art and title never wait on it).
export function GamePageHero({
  game,
  features,
  show,
  canEdit,
  userId,
}: {
  game: Game;
  features: FeatureView;
  show: GamePageShow;
  // The viewer may open the Game Edit page (Admins, Regulars and staff).
  canEdit: boolean;
  // The signed-in member, who gets the list control; null signed out.
  userId: string | null;
}) {
  return (
    <GameHero
      game={game}
      badge={features.preview("game_index") && <PreviewBadge />}
      action={
        canEdit && (
          <ButtonLink href={`/games/${game.game_id}/edit`} variant="overlay">
            <Pencil aria-hidden />
            Edit game
          </ButtonLink>
        )
      }
      lists={
        userId && (
          <Suspense fallback={<GameShelfControlSkeleton />}>
            <GameShelfControl
              game={game}
              userId={userId}
              shown={{
                now_playing: show.playing,
                completed: show.completed,
                backlog: show.backlog,
                favorite: true,
                collection: show.collection,
              }}
            />
          </Suspense>
        )
      }
      panel={
        <Suspense fallback={<GameHeroPanelSkeleton />}>
          <GameHeroPanel game={game} show={show} />
        </Suspense>
      }
    />
  );
}
