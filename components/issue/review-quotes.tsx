import Link from "next/link";
import type { Review } from "@/lib/api/types";
import { MAX_RATING } from "@/lib/api/rating";
import { SectionHeading } from "@/components/issue/page-header";
import { ReviewerAvatar, reviewerName } from "@/components/issue/review-meta";
import { reviewPullQuote } from "@/components/issue/review-quote";

// "In their words": a line from each of a few reviews, set as pull quotes.
// Each quote is the writer's own sentence, verbatim (see reviewPullQuote),
// and opens that review in the reader. Renders nothing when no review on the
// page has a quotable line.

const MAX_QUOTES = 3;

export function ReviewQuotes({
  reviews,
  hrefs,
}: {
  reviews: Review[];
  hrefs: Record<number, string>;
}) {
  const quotes = reviews
    .flatMap((review) => {
      const quote = reviewPullQuote(review.body);
      return quote ? [{ review, quote }] : [];
    })
    .slice(0, MAX_QUOTES);
  if (quotes.length === 0) return null;

  return (
    <section aria-labelledby="in-their-words" className="space-y-4">
      <SectionHeading title={<span id="in-their-words">In their words</span>} />
      <div className="grid gap-x-7 gap-y-5 md:grid-cols-3">
        {quotes.map(({ review, quote }) => {
          const name = reviewerName(review.user, "A member");
          return (
            <figure
              key={review.review_id}
              className="border-t border-rule pt-3.5"
            >
              <blockquote className="font-headline text-[1.5rem] leading-[1.02] md:text-[1.7rem]">
                <Link
                  href={hrefs[review.review_id]}
                  className="transition-colors hover:text-highlight"
                >
                  <span aria-hidden className="text-paper-mute">
                    &ldquo;
                  </span>
                  {quote}
                  <span aria-hidden className="text-paper-mute">
                    &rdquo;
                  </span>
                </Link>
              </blockquote>
              <figcaption className="mt-3 flex items-center gap-2 text-[0.85rem] text-paper-mute">
                <ReviewerAvatar userId={review.user_id} name={name} size="sm" />
                <span>
                  <b className="font-semibold text-paper">{name}</b> ·{" "}
                  {review.rating}/{MAX_RATING}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
