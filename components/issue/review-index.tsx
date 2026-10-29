import Link from "next/link";
import type { Review } from "@/lib/api/types";
import {
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
  reviewerName,
} from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";

// The reader's left column: every review on the page as a compact row (score,
// headline, byline), the open one marked. Each row opens that review in the
// reader beside it.
export function ReviewIndex({
  reviews,
  hrefs,
  activeId,
}: {
  reviews: Review[];
  hrefs: Record<number, string>;
  activeId: number | null;
}) {
  return (
    <ol className="border-t-2 border-paper">
      {reviews.map((review) => {
        const name = reviewerName(review.user, "A member");
        const active = review.review_id === activeId;
        return (
          <li key={review.review_id}>
            <Link
              href={hrefs[review.review_id]}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group/row grid grid-cols-[52px_1fr] items-start gap-3.5 border-b border-rule px-3 py-3.5 transition-colors",
                active ? "bg-ink-3" : "hover:bg-ink-2",
              )}
            >
              <ScoreBox rating={review.rating} className="size-[52px] text-[1.8rem]" />
              <span className="min-w-0">
                <b
                  className={cn(
                    "font-label block text-base leading-[1.15] font-extrabold tracking-[0.01em] transition-colors",
                    active ? "text-paper" : "group-hover/row:text-highlight",
                  )}
                >
                  {review.title ?? `${name}'s review`}
                </b>
                <small className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-paper-mute">
                  <ReviewerAvatar userId={review.user_id} name={name} size="xs" />
                  <span className="truncate">
                    {name} · {formatReviewDate(review.created_at)}
                  </span>
                </small>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
