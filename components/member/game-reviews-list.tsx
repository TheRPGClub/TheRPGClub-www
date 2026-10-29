"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { ReviewCard } from "@/components/issue/review-card";
import { ReviewComposePanel } from "@/components/issue/review-compose-panel";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

// The editor is the heaviest thing a game page can pull in, and most visitors
// never open it — anonymous ones cannot. It loads on demand.
const ReviewForm = dynamic(
  () =>
    import("@/components/member/review-form").then((m) => ({
      default: m.ReviewForm,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="py-6 text-center text-sm text-paper-mute">
        Loading editor…
      </p>
    ),
  },
);

// The crew strip only splits as far as it has reviews to fill, so a lone
// review never sits beside two empty cells.
const CREW_COLUMNS: Record<number, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

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
  const router = useRouter();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [composing, setComposing] = useState(startComposing);
  // `startComposing` follows the URL, which can change without a remount.
  const [prevStart, setPrevStart] = useState(startComposing);
  if (startComposing !== prevStart) {
    setPrevStart(startComposing);
    setComposing(startComposing);
  }

  const ownReview =
    ownerId == null
      ? null
      : (reviews.find((r) => r.user_id === ownerId) ?? null);

  const showCta = showCompose && ownerId !== null && ownReview === null;

  // Handing over to the full page: the save has already happened, so this only
  // has to go somewhere.
  // `?edit` so the full page opens in the editor rather than dropping the
  // writer back into a read view they then have to click out of.
  const openFullEditor = (review: Review) =>
    router.push(`/games/${gameId}/reviews/${review.review_id}?edit=1`);

  const closeComposer = () => {
    setComposing(false);
    if (startComposing && composeCloseHref) {
      router.replace(composeCloseHref, { scroll: false });
    }
  };

  const crew = layout === "crew";
  const visible = limit ? reviews.slice(0, limit) : reviews;
  const items = visible.map((review) => {
    const isOwn = review.user_id === ownerId;
    if (isOwn && editingReviewId === review.review_id) {
      return (
        <div key={review.review_id} className="col-span-full">
          <ReviewForm
            userId={ownerId!}
            gameId={gameId}
            existing={review}
            accent={accent}
            showDelete
            toolbar="compact"
            scorecard={false}
            onCancel={() => setEditingReviewId(null)}
            onSaved={() => setEditingReviewId(null)}
            onTransfer={openFullEditor}
          />
        </div>
      );
    }
    // The owner's card looks like everyone else's; a pencil in its byline
    // flips it into the small editor.
    return (
      <ReviewCard
        key={review.review_id}
        review={review}
        href={reviewHrefs?.[review.review_id]}
        variant={crew ? "column" : "card"}
        facetLimit={crew ? 3 : 4}
        trailing={
          isOwn ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Edit your review"
              className="text-paper-mute hover:text-paper"
              onClick={() => setEditingReviewId(review.review_id)}
            >
              <Pencil />
            </Button>
          ) : undefined
        }
      />
    );
  });

  return (
    <div className="space-y-4">
      {showCta && !composing && (
        <ReviewComposePanel
          ownerId={ownerId}
          canWriteReview={canWriteReview}
          status={viewerStatus}
          onStart={() => setComposing(true)}
        />
      )}

      {composing && ownerId !== null && ownReview === null && (
        <div id="compose" className="scroll-mt-20">
          <ReviewForm
            userId={ownerId}
            gameId={gameId}
            accent={accent}
            toolbar="compact"
            scorecard={false}
            onCancel={closeComposer}
            onSaved={closeComposer}
            onTransfer={openFullEditor}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        !composing && (
          <p className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center text-sm text-paper-mute">
            {canWriteReview
              ? `${emptyMessage} Be the first to share what you think.`
              : emptyMessage}
          </p>
        )
      ) : (
        <div
          className={cn(
            crew
              ? [
                  "grid gap-px overflow-hidden rounded-md border border-rule bg-rule",
                  CREW_COLUMNS[Math.min(visible.length, 3)],
                ]
              : "grid items-start gap-4 lg:grid-cols-2",
          )}
        >
          {items}
        </div>
      )}
    </div>
  );
}
