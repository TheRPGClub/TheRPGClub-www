import Link from "next/link";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import type { Game, Review } from "@/lib/api/types";
import { reviewBodyText } from "@/lib/api/review-body";
import { ReviewBodyContent } from "@/components/member/review-body";
import {
  FacetBars,
  ReviewerAvatar,
  ScoreBox,
  formatReviewDate,
  scoredFacets,
} from "@/components/issue/review-meta";

// The reviews list's inline reader: one review open in full beside the list.
// A slim art banner carrying the byline and the score, the headline, the
// facet strip, then the whole review. Server-rendered, so opening a review
// ships no renderer.

export interface ReaderNeighbour {
  href: string;
  title: string;
}

export function ReviewReader({
  review,
  game,
  authorName,
  backHref,
  newer,
  older,
  isMine,
}: {
  review: Review;
  game: Pick<Game, "game_id" | "title" | "art_url" | "cover_url">;
  authorName: string;
  backHref: string;
  newer: ReaderNeighbour | null;
  older: ReaderNeighbour | null;
  isMine: boolean;
}) {
  const art = game.art_url ?? game.cover_url;
  const facets = scoredFacets(review.facets);
  const hasBody = reviewBodyText(review.body) !== null;
  const fullHref = `/games/${game.game_id}/reviews/${review.review_id}`;

  return (
    <article aria-labelledby="reader-title" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link
          href={backHref}
          className="font-label inline-flex items-center gap-1.5 text-[0.88rem] font-extrabold tracking-[0.08em] text-paper transition-colors hover:text-highlight [&_svg]:size-4 [&_svg]:text-gotm"
        >
          <ArrowLeft aria-hidden />
          Back to reviews
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {isMine && (
            <Link
              href={`${fullHref}?edit=1`}
              className="font-label inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:text-highlight [&_svg]:size-3.5"
            >
              <Pencil aria-hidden />
              Edit your review
            </Link>
          )}
          <Link
            href={fullHref}
            className="font-label inline-flex items-center gap-1.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:text-highlight [&_svg]:size-3.5"
          >
            Open as a page
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </div>

      <div className="relative isolate h-[140px] overflow-hidden rounded-md bg-ink-3 md:h-[170px]">
        {art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art}
            alt=""
            className="absolute inset-0 -z-20 size-full object-cover object-[60%_28%] opacity-75"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(11_11_13/0.85),rgb(11_11_13/0.1))]"
        />
        <div className="absolute bottom-4 left-4 flex items-center gap-2.5 md:bottom-4.5 md:left-5">
          <ReviewerAvatar userId={review.user_id} name={authorName} size="lg" />
          <div className="leading-tight">
            <Link
              href={`/members/${review.user_id}`}
              className="block font-semibold hover:text-highlight"
            >
              {authorName}
            </Link>
            <small className="text-[0.82rem] text-paper-dim">
              Reviewed{" "}
              <time dateTime={review.created_at}>
                {formatReviewDate(review.created_at)}
              </time>
            </small>
          </div>
        </div>
        <ScoreBox
          rating={review.rating}
          className="absolute right-4 -bottom-px size-[76px] rounded-b-none text-[2.75rem] md:right-4.5 md:size-24 md:text-[3.6rem]"
        />
      </div>

      <h2
        id="reader-title"
        className="font-headline mt-5 text-[2.4rem] leading-[0.92] text-balance md:text-[3.6rem]"
      >
        {review.title ?? `${authorName} on ${game.title}`}
      </h2>

      {facets.length > 0 ? (
        <FacetBars
          facets={facets}
          className="mt-4.5 grid-cols-2 gap-x-5 gap-y-3 border-t-2 border-b border-t-paper border-b-rule py-3.5 sm:grid-cols-3 xl:grid-cols-4"
          valueClassName="text-[1.4rem]"
        />
      ) : (
        <div aria-hidden className="mt-4.5 border-t-2 border-paper" />
      )}

      <div className="mt-6 max-w-[68ch]">
        {hasBody ? (
          <ReviewBodyContent body={review.body} variant="article" />
        ) : (
          <p className="text-paper-mute italic">
            {authorName} scored this game without writing a review.
          </p>
        )}
      </div>

      {(newer || older) && (
        <nav
          aria-label="More reviews"
          className="mt-8 flex justify-between gap-3.5 border-t border-rule pt-4"
        >
          {newer ? (
            <Link
              href={newer.href}
              className="group/nx font-label flex max-w-[48%] flex-col gap-1 text-[0.78rem] font-extrabold tracking-[0.08em] text-paper-mute"
            >
              Previous
              <b className="text-base leading-tight tracking-[0.01em] text-paper transition-colors group-hover/nx:text-highlight">
                {newer.title}
              </b>
            </Link>
          ) : (
            <span />
          )}
          {older && (
            <Link
              href={older.href}
              className="group/nx font-label flex max-w-[48%] flex-col gap-1 text-right text-[0.78rem] font-extrabold tracking-[0.08em] text-paper-mute"
            >
              Next review
              <b className="text-base leading-tight tracking-[0.01em] text-paper transition-colors group-hover/nx:text-highlight">
                {older.title}
              </b>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
