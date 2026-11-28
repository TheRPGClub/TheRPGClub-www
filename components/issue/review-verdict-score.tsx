import Link from "next/link";
import { MAX_RATING } from "@/lib/api/rating";
import type { Review } from "@/lib/api/types";
import { reviewDate } from "@/lib/reviews/review-date";
import {
  ReviewerAvatar,
  formatReviewDate,
} from "@/components/issue/review-meta";

// The verdict's paper block: the overall score as a monumental numeral,
// signed by the reviewer.
export function ReviewVerdictScore({
  review,
  authorName,
}: {
  review: Review;
  authorName: string;
}) {
  return (
    <div data-slot="verdict-score" className="flex flex-wrap items-end gap-x-3.5 bg-foreground p-4 text-background md:flex-col md:flex-nowrap md:items-stretch md:p-5.5">
      <h2 id="verdict" className="sr-only">
        Verdict
      </h2>
      <p
        className="font-headline text-[6.5rem] leading-[0.8] tracking-[-0.02em] md:text-[10.5rem]"
      >
        {review.rating}
      </p>
      <p className="font-label mb-1.5 text-sm font-extrabold tracking-[0.08em] md:mt-2 md:mb-0">
        Out of {MAX_RATING}
      </p>
      <div className="mt-1 flex w-full items-center gap-2.5 border-t border-background/20 pt-3 md:mt-auto md:pt-4.5">
        <ReviewerAvatar
          userId={review.user_id}
          discordAvatar={review.user?.discord_avatar}
          name={authorName}
          className="ring-2 ring-background"
        />
        <div className="min-w-0 leading-tight">
          <Link
            href={`/members/${review.user_id}`}
            className="block truncate font-bold hover:underline"
          >
            {authorName}
          </Link>
          <small className="text-[0.82rem] text-background/70">
            Reviewed {formatReviewDate(reviewDate(review))}
          </small>
        </div>
      </div>
    </div>
  );
}
