import type { Review } from "@/lib/api/types";
import { MAX_RATING } from "@/lib/api/rating";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { ReviewCard } from "@/components/issue/review-card";
import { cn } from "@/lib/utils";

export interface MemberReviewCardProps {
  review: Review;
  // When true, hides the user line (we're on the member profile already).
  // When false, shows it (we're on a game page).
  hideUser?: boolean;
  hideGame?: boolean;
  trailing?: React.ReactNode;
  className?: string;
  // Kept for callers that still pass a hue. Review cards no longer tint by
  // track: track colour is reserved for GOTM and NR-GOTM marks.
  accent?: ReviewAccent;
}

// A review in a list, in the Monthly Issue's card: the score block in the
// corner, the byline, the headline, the first facets and a bounded excerpt.
// A thin adapter over the shared ReviewCard so member pages keep their props.
export function MemberReviewCard({
  review,
  hideUser,
  hideGame,
  trailing,
  className,
}: MemberReviewCardProps) {
  return (
    <ReviewCard
      review={review}
      variant="card"
      showUser={!hideUser}
      showGame={!hideGame}
      trailing={trailing}
      className={className}
    />
  );
}

// The score as a compact readout: an Anton numeral over a thin bar.
export function ReviewRating({
  rating,
}: {
  rating: number | null;
  accent?: ReviewAccent;
}) {
  if (rating === null || rating === undefined) {
    return <p className="text-sm text-paper-mute">No rating</p>;
  }
  const pct = Math.max(0, Math.min(100, (rating / MAX_RATING) * 100));
  return (
    <div
      className="flex items-center gap-2"
      aria-label={`Rated ${rating} out of ${MAX_RATING}`}
    >
      <span className="font-headline text-xl leading-none">{rating}</span>
      <span className="font-label text-xs text-paper-mute">/ {MAX_RATING}</span>
      <div aria-hidden className="h-1 w-20 overflow-hidden rounded-[2px] bg-ink-3">
        <div className={cn("h-full bg-paper")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
