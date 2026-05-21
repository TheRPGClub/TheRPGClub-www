"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MemberReviewCard } from "@/components/member/member-review-card";
import { ReviewForm } from "@/components/member/review-form";

export interface GameReviewsListProps {
  gameId: number;
  reviews: Review[];
  // Logged-in viewer's user_id, or null when anonymous. Used to find their
  // own review in the list and surface the edit affordance.
  ownerId: string | null;
  // Server-decided eligibility (has now_playing or completion entry for game).
  canWriteReview?: boolean;
  emptyMessage?: string;
  // When true (the default), shows the "Write a review" CTA above the list
  // when the owner hasn't reviewed yet. The detail page sets this to false.
  showComposeCta?: boolean;
  // Render the full body instead of the line-clamped preview. Used on the
  // single-review detail page; listing contexts leave the clamp on so the
  // "Read more →" affordance kicks in.
  showFullBody?: boolean;
}

// One source of truth for the reviews block on game pages. It dedupes the
// owner's review by injecting an Edit button on their row (instead of
// rendering a separate "your review" section that duplicates the entry).
export function GameReviewsList({
  gameId,
  reviews,
  ownerId,
  canWriteReview = false,
  emptyMessage = "No reviews yet.",
  showComposeCta = true,
  showFullBody = false,
}: GameReviewsListProps) {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);

  const ownReview =
    ownerId == null
      ? null
      : reviews.find((r) => r.user_id === ownerId) ?? null;

  const showCta = showComposeCta && ownerId !== null && ownReview === null;

  return (
    <div className="space-y-3">
      {showCta && !composing && (
        <ComposeCta
          ownerId={ownerId!}
          canWriteReview={canWriteReview}
          onStart={() => setComposing(true)}
        />
      )}

      {composing && ownerId !== null && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <ReviewForm
            userId={ownerId}
            gameId={gameId}
            onCancel={() => setComposing(false)}
            onSaved={() => setComposing(false)}
          />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {canWriteReview && showComposeCta
            ? `${emptyMessage} Be the first to share what you think.`
            : emptyMessage}
        </p>
      ) : (
        reviews.map((review) => {
          const isOwn = review.user_id === ownerId;
          if (isOwn && editingReviewId === review.review_id) {
            return (
              <div
                key={review.review_id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <ReviewForm
                  userId={ownerId!}
                  gameId={gameId}
                  existing={review}
                  showDelete
                  onCancel={() => setEditingReviewId(null)}
                  onSaved={() => setEditingReviewId(null)}
                />
              </div>
            );
          }
          // The owner's row looks identical to everyone else's (same avatar,
          // username, body treatment). The only difference is a trailing
          // pencil button so they can flip the card into edit mode.
          return (
            <MemberReviewCard
              key={review.review_id}
              review={review}
              hideGame
              showFullBody={showFullBody}
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
        })
      )}
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
  // Eligibility gate: disabled native button can't host hover events, so wrap
  // it in a span that owns the tooltip trigger.
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
