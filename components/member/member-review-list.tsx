import type { Review } from "@/lib/api/types";
import { MemberReviewCard } from "./member-review-card";
import { cn } from "@/lib/utils";

export interface MemberReviewListProps {
  reviews: Review[];
  hideUser?: boolean;
  hideGame?: boolean;
  emptyMessage?: string;
  renderTrailing?: (review: Review) => React.ReactNode;
  className?: string;
}

export function MemberReviewList({
  reviews,
  hideUser,
  hideGame,
  emptyMessage = "No reviews yet.",
  renderTrailing,
  className,
}: MemberReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-rule-strong px-4 py-6 text-center text-sm text-paper-mute">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("grid items-start gap-4 md:grid-cols-2", className)}>
      {reviews.map((review) => (
        <MemberReviewCard
          key={review.review_id}
          review={review}
          hideUser={hideUser}
          hideGame={hideGame}
          trailing={renderTrailing?.(review)}
        />
      ))}
    </div>
  );
}
