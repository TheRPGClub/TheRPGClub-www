import type { ReactNode } from "react";
import type { Game, Review } from "@/lib/api/types";
import type { SelectedReview } from "@/lib/games/reviews-page";
import { ReviewIndex } from "@/components/issue/review-index";
import { reviewerName } from "@/components/issue/review-meta";
import { ReviewReader } from "@/components/issue/review-reader";

// The reviews page's reader (`?review=<id>`): the chosen review open in full
// on the right while the page's reviews stay listed on the left.
export function ReviewsReader({
  game,
  strip,
  reviews,
  selected,
  total,
  currentPage,
  totalPages,
  readerHrefs,
  backHref,
  isMine,
  pagination,
  composePanel,
}: {
  game: Game;
  // The game strip across the top.
  strip: ReactNode;
  reviews: Review[];
  selected: SelectedReview;
  total: number;
  currentPage: number;
  totalPages: number;
  // Each listed review's reader URL, from the page it was opened from.
  readerHrefs: Record<number, string>;
  // The list, on the page the reader was opened from.
  backHref: string;
  isMine: boolean;
  pagination: ReactNode;
  composePanel: ReactNode;
}) {
  const index = reviews.findIndex((r) => r.review_id === selected.review.review_id);
  const neighbour = (r: Review | undefined) =>
    r
      ? {
          href: readerHrefs[r.review_id],
          title: r.title ?? `${reviewerName(r.user, "A member")}'s review`,
        }
      : null;

  return (
    <div className="pb-10">
      {strip}
      <div className="mt-6 grid gap-8 lg:grid-cols-[21rem_minmax(0,1fr)] xl:grid-cols-[23.75rem_minmax(0,1fr)]">
        <aside
          aria-label="All reviews"
          className="order-2 lg:sticky lg:top-20 lg:order-1 lg:self-start"
        >
          <div className="mb-3 flex items-baseline gap-2.5">
            <h1 className="font-headline text-[2.6rem] leading-[0.9]">Reviews</h1>
            <span className="font-headline text-2xl text-faint-foreground">{total}</span>
            {totalPages > 1 && (
              <span className="font-label ml-auto text-[0.8rem] text-faint-foreground">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
          <ReviewIndex
            reviews={reviews}
            hrefs={readerHrefs}
            activeId={selected.review.review_id}
          />
          <div className="mt-4">{pagination}</div>
          {composePanel && <div className="mt-4">{composePanel}</div>}
        </aside>

        <div className="order-1 lg:order-2">
          <ReviewReader
            review={selected.review}
            game={game}
            authorName={selected.authorName}
            backHref={backHref}
            newer={index > 0 ? neighbour(reviews[index - 1]) : null}
            older={
              index >= 0 && index < reviews.length - 1
                ? neighbour(reviews[index + 1])
                : null
            }
            isMine={isMine}
          />
        </div>
      </div>
    </div>
  );
}
