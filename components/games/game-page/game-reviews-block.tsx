import type { Game } from "@/lib/api/types";
import { loadGameReviews } from "@/lib/games/game-page";
import type { ViewerOnGame } from "@/lib/games/viewer";
import { accentForGame } from "@/lib/reviews/accent";
import { GameReviewsSection } from "@/components/games/game-page/game-reviews-section";
import { DraftSlot } from "@/components/reviews/drafts/draft-slot";

// The game page's Reviews: its own reads (the first reviews and the viewer's
// Draft), streamed in its own Suspense so the rest of the page doesn't wait.
export async function GameReviewsBlock({
  game,
  viewer,
  viewerId,
}: {
  game: Game;
  viewer: ViewerOnGame;
  viewerId: string | null;
}) {
  const { reviews, reviewTotal, ownDraft } = await loadGameReviews(game.game_id, viewerId);
  return (
    <GameReviewsSection
      gameId={game.game_id}
      reviews={reviews}
      reviewTotal={reviewTotal}
      viewer={viewer}
      accent={accentForGame(game)}
      draftSlot={
        ownDraft && (
          <DraftSlot draft={ownDraft.draft} now={ownDraft.now} gameTitle={game.title} coverUrl={game.cover_url} />
        )
      }
    />
  );
}
