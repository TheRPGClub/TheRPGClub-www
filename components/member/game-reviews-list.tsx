"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { MemberReviewCard } from "@/components/member/member-review-card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";

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
      <p className="py-6 text-center text-sm text-muted-foreground">
        Loading editor…
      </p>
    ),
  },
);

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
  accent?: ReviewAccent;
}

// The reviews block on game pages. Writing and editing happen here, in a
// small editor scoped to the card it replaces; the full-page editor is one
// step further on, offered from inside that editor rather than as a standing
// button — there is nothing to open until you are actually writing.
export function GameReviewsList({
  gameId,
  reviews,
  ownerId,
  canWriteReview = false,
  emptyMessage = "No reviews yet.",
  accent = "neutral",
}: GameReviewsListProps) {
  const router = useRouter();
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);

  const ownReview =
    ownerId == null
      ? null
      : (reviews.find((r) => r.user_id === ownerId) ?? null);

  const showCta = ownerId !== null && ownReview === null;

  // Handing over to the full page: the save has already happened, so this only
  // has to go somewhere.
  // `?edit` so the full page opens in the editor rather than dropping the
  // writer back into a read view they then have to click out of.
  const openFullEditor = (review: Review) =>
    router.push(`/games/${gameId}/reviews/${review.review_id}?edit=1`);

  return (
    <div className="space-y-3">
      {showCta && !composing && (
        <ComposeCta
          ownerId={ownerId}
          canWriteReview={canWriteReview}
          onStart={() => setComposing(true)}
        />
      )}

      {composing && ownerId !== null && (
        <ReviewForm
          userId={ownerId}
          gameId={gameId}
          accent={accent}
          toolbar="compact"
          onCancel={() => setComposing(false)}
          onSaved={() => setComposing(false)}
          onTransfer={openFullEditor}
        />
      )}

      {reviews.length === 0
        ? !composing && (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              {canWriteReview
                ? `${emptyMessage} Be the first to share what you think.`
                : emptyMessage}
            </p>
          )
        : reviews.map((review) => {
            const isOwn = review.user_id === ownerId;
            if (isOwn && editingReviewId === review.review_id) {
              return (
                <ReviewForm
                  key={review.review_id}
                  userId={ownerId!}
                  gameId={gameId}
                  existing={review}
                  accent={accent}
                  showDelete
                  toolbar="compact"
                  onCancel={() => setEditingReviewId(null)}
                  onSaved={() => setEditingReviewId(null)}
                  onTransfer={openFullEditor}
                />
              );
            }
            // The owner's row looks identical to everyone else's. The only
            // difference is a trailing pencil that flips the card into the
            // small editor.
            return (
              <MemberReviewCard
                key={review.review_id}
                review={review}
                hideGame
                accent={accent}
                trailing={
                  isOwn ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit your review"
                      onClick={() => setEditingReviewId(review.review_id)}
                    >
                      <Pencil />
                    </Button>
                  ) : undefined
                }
              />
            );
          })}
    </div>
  );
}

function ComposeCta({
  ownerId,
  canWriteReview,
  onStart,
}: {
  ownerId: string;
  canWriteReview: boolean;
  onStart: () => void;
}) {
  if (canWriteReview) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-4 text-center">
        <Button type="button" size="sm" onClick={onStart}>
          <Plus />
          Write a review
        </Button>
      </div>
    );
  }
  // Eligibility gate: a disabled native button can't host hover events, so the
  // tooltip trigger owns a wrapping span.
  return (
    <div className="rounded-xl border border-dashed bg-card/40 p-4 text-center">
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" tabIndex={0} />}>
          <Button type="button" size="sm" disabled>
            <Plus />
            Write a review
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Add this game to{" "}
          <Link
            href={`/members/${ownerId}/edit`}
            className="underline underline-offset-2"
          >
            Now Playing or Completed
          </Link>{" "}
          first.
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
