import Link from "next/link";
import type { Review } from "@/lib/api/types";
import { reviewDate } from "@/lib/reviews/review-date";
import {
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
} from "@/components/issue/review-meta";
import { reviewerName } from "@/lib/reviews/reviewer-name";
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
    <ol className="border-t-2 border-foreground">
      {reviews.map((review) => {
        const name = reviewerName(review.user, "A member");
        const active = review.review_id === activeId;
        return (
          <li key={review.review_id}>
            <Link
              href={hrefs[review.review_id]}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group/row grid grid-cols-[52px_1fr] items-start gap-3.5 border-b border-border px-3 py-3.5 transition-colors",
                active ? "bg-muted" : "hover:bg-card",
              )}
            >
              <ScoreBox rating={review.rating} className="size-[52px] text-[1.8rem]" />
              <span className="min-w-0">
                <b
                  className={cn(
                    "font-label block text-base leading-[1.15] font-extrabold tracking-[0.01em] transition-colors",
                    active ? "text-foreground" : "group-hover/row:text-highlight",
                  )}
                >
                  {review.title ?? `${name}'s review`}
                </b>
                <small className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-faint-foreground">
                  <ReviewerAvatar userId={review.user_id} discordAvatar={review.user?.discord_avatar} name={name} size="xs" />
                  <span className="truncate">
                    {name} · {formatReviewDate(reviewDate(review))}
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
