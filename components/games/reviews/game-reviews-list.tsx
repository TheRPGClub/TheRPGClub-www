"use client";

import { useReviewComposer } from "@/hooks/use-review-composer";

import { ReviewComposePanel } from "@/components/issue/review-compose-panel";
import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import {
  GameReviewItem,
  GameReviewsGrid,
} from "@/components/games/reviews/game-review-item";
import { LazyReviewForm } from "@/components/games/reviews/review-form-lazy";

export interface GameReviewsListProps {
  gameId: number;
  reviews: Review[];
  // Logged-in viewer's user_id, or null when anonymous. Used to find their
  // own review in the list and surface the edit affordance.
  ownerId: string | null;
  // Server-decided eligibility (has now_playing or completion entry for game).
  canWriteReview?: boolean;
  emptyMessage?: string;
  // The game's category hue, resolved by the page that has the game to hand.
  // Only the composer's rating control still wears it.
  accent?: ReviewAccent;
  // `crew` is the game page's three-up strip; `cards` the reviews list's
  // two-column cards.
  layout?: "crew" | "cards";
  // Where the viewer stands with the game, for the yellow panel's line.
  viewerStatus?: "playing" | "completed" | null;
  // False where the page puts the write-a-review panel somewhere else (the
  // reviews list keeps it in its left column and opens the composer through
  // `?compose`).
  showCompose?: boolean;
  // Opens the composer straight away; `composeCloseHref` is where closing it
  // goes, so the `?compose` that opened it drops out of the URL.
  startComposing?: boolean;
  composeCloseHref?: string;
  // Per-review link for the title and "Read the rest". Defaults to the
  // review's own page.
  reviewHrefs?: Record<number, string>;
  // Shows only the first `limit` reviews. The rest still count when looking
  // for the viewer's own, so the composer never offers a second one.
  limit?: number;
}

// The reviews block on game pages. Writing and editing happen here, in a
// small editor scoped to the card it replaces; the full-page editor is one
// step further on, offered from inside that editor rather than as a standing
// button — there is nothing to open until you are actually writing.
//
// This composer is the quick one: a score and a few words. The scorecard
// belongs to the full editor, because grading a game across seven categories
// is not something to do in a box the size of a comment field. A review that
// already carries one keeps it through a save made here.
export function GameReviewsList({
  gameId,
  reviews,
  ownerId,
  canWriteReview = false,
  emptyMessage = "No reviews yet.",
  accent = "neutral",
  layout = "cards",
  viewerStatus = null,
  showCompose = true,
  startComposing = false,
  composeCloseHref,
  reviewHrefs,
  limit,
}: GameReviewsListProps) {
  const {
    composing,
    openComposer,
    closeComposer,
    editingReviewId,
    setEditingReviewId,
    openFullEditor,
  } = useReviewComposer({ gameId, startComposing, composeCloseHref });

  const ownReview =
    ownerId == null
      ? null
      : (reviews.find((r) => r.user_id === ownerId) ?? null);

  const showCta = showCompose && ownerId !== null && ownReview === null;

  const crew = layout === "crew";
  const visible = limit ? reviews.slice(0, limit) : reviews;
  const items = visible.map((review) => (
    <GameReviewItem
      key={review.review_id}
      review={review}
      gameId={gameId}
      ownerId={ownerId}
      editing={editingReviewId === review.review_id}
      crew={crew}
      accent={accent}
      href={reviewHrefs?.[review.review_id]}
      onEdit={() => setEditingReviewId(review.review_id)}
      onDone={() => setEditingReviewId(null)}
      onTransfer={openFullEditor}
    />
  ));

  return (
    <div className="space-y-4">
      {showCta && !composing && (
        <ReviewComposePanel
          ownerId={ownerId}
          canWriteReview={canWriteReview}
          status={viewerStatus}
          onStart={openComposer}
        />
      )}

      {composing && ownerId !== null && ownReview === null && (
        <div id="compose" className="scroll-mt-20">
          <LazyReviewForm
            userId={ownerId}
            gameId={gameId}
            accent={accent}
            layout="quick"
            onCancel={closeComposer}
            onSaved={closeComposer}
            onTransfer={openFullEditor}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        !composing && (
          <p className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-faint-foreground">
            {canWriteReview
              ? `${emptyMessage} Be the first to share what you think.`
              : emptyMessage}
          </p>
        )
      ) : (
        <GameReviewsGrid crew={crew} count={visible.length}>
          {items}
        </GameReviewsGrid>
      )}
    </div>
  );
}
