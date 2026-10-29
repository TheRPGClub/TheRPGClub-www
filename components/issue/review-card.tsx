import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { reviewBodyExcerpt, reviewBodyText } from "@/lib/api/review-body";
import {
  FacetBars,
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
  reviewerName,
  scoredFacets,
} from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";

// Code-split, not client-only: the card is reached through client lists (the
// game page's composer wraps it), and a static import would put the whole
// Plate renderer in their bundle. The excerpt stays server-prerendered and
// keeps its formatting and spoilers.
const ReviewBodyContent = dynamic(() =>
  import("@/components/member/review-body").then((m) => ({
    default: m.ReviewBodyContent,
  })),
);

export interface ReviewCardProps {
  review: Review;
  // Where the title and "Read the rest" go: the review's own page, or the
  // reviews list's inline reader.
  href?: string;
  // `column` is the game page's three-up crew; `card` is the reviews list's
  // card with the score block in its corner.
  variant?: "column" | "card";
  showUser?: boolean;
  // A member's own list names the game instead of the member.
  showGame?: boolean;
  // How many facet rows a card shows; the review itself shows them all.
  facetLimit?: number;
  // The owner's edit control, at the end of the byline.
  trailing?: React.ReactNode;
  className?: string;
}

export function ReviewCard({
  review,
  href,
  variant = "column",
  showUser = true,
  showGame = false,
  facetLimit = 3,
  trailing,
  className,
}: ReviewCardProps) {
  const target =
    href ?? `/games/${review.gamedb_game_id}/reviews/${review.review_id}`;
  const name = reviewerName(review.user, "A member");
  const hasBody = reviewBodyText(review.body) !== null;
  const excerpt = reviewBodyExcerpt(review.body, variant === "card" ? 280 : 200);
  const facets = scoredFacets(review.facets);
  const date = (
    <time dateTime={review.created_at}>{formatReviewDate(review.created_at)}</time>
  );

  const byline = (
    <div className="flex min-w-0 items-center gap-2.5">
      {showUser && review.user && (
        <ReviewerAvatar userId={review.user_id} name={name} />
      )}
      <div className="min-w-0 leading-tight">
        {showUser && review.user ? (
          <Link
            href={`/members/${review.user_id}`}
            className="block truncate text-sm font-semibold hover:text-highlight"
          >
            {name}
          </Link>
        ) : showGame && review.game ? (
          <Link
            href={`/games/${review.gamedb_game_id}`}
            className="font-label block truncate text-[0.95rem] font-extrabold hover:text-highlight"
          >
            {review.game.title}
          </Link>
        ) : null}
        <small className="block text-[0.8rem] text-paper-mute">
          {showUser && showGame && review.game && (
            <>
              <Link
                href={`/games/${review.gamedb_game_id}`}
                className="hover:text-paper"
              >
                {review.game.title}
              </Link>
              {" · "}
            </>
          )}
          {date}
        </small>
      </div>
    </div>
  );

  const title = review.title && (
    <h3
      className={cn(
        "font-label leading-[1.12] font-extrabold tracking-[0.01em]",
        variant === "card" ? "text-[1.3rem]" : "text-[1.2rem]",
      )}
    >
      <Link href={target} className="transition-colors hover:text-highlight">
        {review.title}
      </Link>
    </h3>
  );

  const body = hasBody ? (
    <div className="text-[0.88rem] leading-[1.6] text-paper-dim [&_h1]:text-paper [&_h2]:text-paper [&_h3]:text-paper">
      <ReviewBodyContent body={excerpt.value} />
    </div>
  ) : (
    <p className="text-[0.88rem] text-paper-mute italic">
      Scored without a written review.
    </p>
  );

  const readLabel = excerpt.truncated ? "Read the rest" : "Open review";

  if (variant === "card") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-md border border-rule bg-ink-2",
          className,
        )}
      >
        <div className="flex items-stretch border-b border-rule">
          <ScoreBox
            rating={review.rating}
            className="h-auto min-h-16 w-[4.9rem] rounded-none text-[2.75rem]"
          />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3.5 py-3">
            {byline}
            {trailing}
          </div>
        </div>
        <div className="space-y-3 px-4 pt-3.5 pb-4">
          {title}
          <FacetBars facets={facets} limit={facetLimit} />
          {body}
          <Link
            href={target}
            className="font-label inline-flex items-center gap-1.5 text-[0.85rem] font-extrabold tracking-[0.08em] transition-colors hover:text-highlight [&_svg]:size-3.5 [&_svg]:text-gotm"
          >
            {readLabel}
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn("flex flex-col gap-3 bg-ink-2 p-[18px]", className)}
    >
      <div className="flex items-center gap-2.5">
        {byline}
        <div className="ml-auto flex items-center gap-1.5">
          {trailing}
          <ScoreBox rating={review.rating} className="size-[62px] text-4xl" />
        </div>
      </div>
      {title}
      <FacetBars facets={facets} limit={facetLimit} />
      {body}
      <div className="font-label mt-auto flex items-center justify-between pt-1 text-[0.82rem] tracking-[0.06em] text-paper-mute">
        <span>{excerpt.truncated ? "Excerpt" : hasBody ? "In full" : "Score only"}</span>
        <Link
          href={target}
          className="font-extrabold text-paper transition-colors hover:text-highlight"
        >
          {readLabel}
        </Link>
      </div>
    </article>
  );
}
