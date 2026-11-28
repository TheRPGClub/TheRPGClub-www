import type { Review } from "@/lib/api/types";
import type { ViewerOnGame } from "@/lib/games/viewer";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { REVIEWS_SHOWN } from "@/lib/games/game-page";
import { GameReviewsList } from "@/components/games/reviews/game-reviews-list";
import { DetailSection, SectionLink } from "@/components/templates/detail-template";

// The game page's Reviews, full width: the first few as the crew strip,
// with the write-a-review panel, and a link to all of them.
export function GameReviewsSection({
  gameId,
  reviews,
  reviewTotal,
  viewer,
  accent,
  draftSlot,
}: {
  gameId: number;
  reviews: Review[];
  // Null when the reviews couldn't be read.
  reviewTotal: number | null;
  viewer: ViewerOnGame;
  accent: ReviewAccent;
  // The viewer's own Draft of the game, in the compose prompt's place.
  draftSlot?: React.ReactNode;
}) {
  return (
    <DetailSection
      id="game-reviews"
      title="Reviews"
      action={
        reviewTotal ? (
          <SectionLink href={`/games/${gameId}/reviews`}>
            {reviewTotal === 1 ? "The review" : `All ${reviewTotal} reviews`}
          </SectionLink>
        ) : undefined
      }
      className="mt-10 min-w-0"
      headingClassName="mb-4"
    >
      {reviewTotal === null ? (
        <p data-slot="shelf-empty" className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-faint-foreground">
          Reviews couldn&apos;t be loaded right now.
        </p>
      ) : (
        <GameReviewsList
          gameId={gameId}
          reviews={reviews}
          limit={REVIEWS_SHOWN}
          ownerId={viewer.ownerId}
          canWriteReview={viewer.canWriteReview}
          viewerStatus={viewer.status}
          layout="crew"
          accent={accent}
          draftSlot={draftSlot}
        />
      )}
    </DetailSection>
  );
}
