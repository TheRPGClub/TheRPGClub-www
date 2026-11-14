"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { ReviewCard } from "@/components/issue/review-card";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/api/types";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { LazyReviewForm } from "@/components/games/reviews/review-form-lazy";

// One review in the game's reviews block. The owner's card looks like
// everyone else's; a pencil in its byline flips it into the small editor,
// which takes the card's place.
export function GameReviewItem({
  review,
  gameId,
  ownerId,
  editing,
  crew,
  accent,
  href,
  onEdit,
  onDone,
  onTransfer,
}: {
  review: Review;
  gameId: number;
  ownerId: string | null;
  editing: boolean;
  // The game page's three-up strip, rather than the reviews list's cards.
  crew: boolean;
  accent: ReviewAccent;
  href?: string;
  onEdit: () => void;
  onDone: () => void;
  onTransfer: (review: Review) => void;
}) {
  const isOwn = review.user_id === ownerId;
  if (isOwn && editing) {
    return (
      <div className="col-span-full">
        <LazyReviewForm
          userId={ownerId!}
          gameId={gameId}
          existing={review}
          accent={accent}
          showDelete
          toolbar="compact"
          scorecard={false}
          onCancel={onDone}
          onSaved={onDone}
          onTransfer={onTransfer}
        />
      </div>
    );
  }
  return (
    <ReviewCard
      review={review}
      href={href}
      variant={crew ? "column" : "card"}
      facetLimit={crew ? 3 : 4}
      trailing={
        isOwn ? (
          <Button
            type="button"
            variant="tool"
            size="icon-sm"
            aria-label="Edit your review"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
        ) : undefined
      }
    />
  );
}

// The crew strip only splits as far as it has reviews to fill, so a lone
// review never sits beside two empty cells.
const CREW_COLUMNS: Record<number, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
};

// The reviews' frame: the game page's crew strip (cells on a hairline grid)
// or the reviews list's two columns of cards.
export function GameReviewsGrid({
  crew,
  count,
  children,
}: {
  crew: boolean;
  count: number;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        crew
          ? [
              "grid gap-px overflow-hidden rounded-md border border-border bg-border",
              CREW_COLUMNS[Math.min(count, 3)],
            ]
          : "grid items-start gap-4 lg:grid-cols-2",
      )}
    >
      {children}
    </div>
  );
}
