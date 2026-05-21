import type { Review } from "@/lib/api/types";
import { MemberReviewCard } from "./member-review-card";
import { cn } from "@/lib/utils";

export interface MemberReviewListProps {
  reviews: Review[];
  hideUser?: boolean;
  hideGame?: boolean;
  showFullBody?: boolean;
  emptyMessage?: string;
  renderTrailing?: (review: Review) => React.ReactNode;
  className?: string;
}

export function MemberReviewList({
  reviews,
  hideUser,
  hideGame,
  showFullBody,
  emptyMessage = "No reviews yet.",
  renderTrailing,
  className,
}: MemberReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {reviews.map((review) => (
        <MemberReviewCard
          key={review.review_id}
          review={review}
          hideUser={hideUser}
          hideGame={hideGame}
          showFullBody={showFullBody}
          trailing={renderTrailing?.(review)}
        />
      ))}
    </div>
  );
}
