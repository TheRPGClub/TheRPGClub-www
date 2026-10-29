import Link from "next/link";
import type { Review } from "@/lib/api/types";
import { MAX_RATING } from "@/lib/api/rating";
import { reviewBodyText } from "@/lib/api/review-body";
import { MemberCover } from "@/components/issue/member-cover";
import { shortDate } from "@/components/member/member-lists";

// The profile's latest reviews as magazine rows: the game's cover, "On
// <game>", the review's headline and opening lines, and the score set big on
// the right with a rule measuring it out of 100.

export function MemberReviewRows({ reviews }: { reviews: Review[] }) {
  return (
    <div>
      {reviews.map((review) => (
        <ReviewRow key={review.review_id} review={review} />
      ))}
    </div>
  );
}

function ReviewRow({ review }: { review: Review }) {
  const game = review.game;
  const gameTitle = game?.title ?? "Unknown game";
  const href = `/games/${review.gamedb_game_id}/reviews/${review.review_id}`;
  const text = reviewBodyText(review.body);
  // Most reviews have no headline; those lead with the game's title.
  const headline = review.title?.trim() || null;
  const when = shortDate(review.created_at);
  const score = Math.max(0, Math.min(MAX_RATING, review.rating));

  return (
    <article className="grid grid-cols-[3.75rem_1fr] items-start gap-x-4.5 gap-y-2 border-b border-rule py-4.5 sm:grid-cols-[5.125rem_1fr_auto]">
      <Link
        href={`/games/${review.gamedb_game_id}`}
        className="group/cover block"
        tabIndex={-1}
        aria-hidden
      >
        <MemberCover game={game} title={gameTitle} fallbackClassName="text-sm" />
      </Link>
      <div className="min-w-0">
        {headline && (
          <p className="font-label mb-1 text-[0.8rem] font-extrabold tracking-[0.08em] text-paper-mute">
            On{" "}
            <Link
              href={`/games/${review.gamedb_game_id}`}
              className="text-paper transition-colors hover:text-highlight"
            >
              {gameTitle}
            </Link>
          </p>
        )}
        <h3 className="text-[1.15rem] leading-tight font-bold text-balance">
          <Link href={href} className="transition-colors hover:text-highlight">
            {headline ?? gameTitle}
          </Link>
        </h3>
        {text && (
          <p className="mt-1.5 line-clamp-2 max-w-[62ch] text-[0.9rem] text-paper-dim">
            {text}
          </p>
        )}
        {when && <p className="mt-2 text-xs text-paper-mute">{when}</p>}
      </div>
      <p
        className="col-start-2 flex items-baseline gap-1.5 sm:col-start-3 sm:block sm:text-right"
        aria-label={`Rated ${score} out of ${MAX_RATING}`}
      >
        <b className="font-headline block text-[2.5rem] leading-[0.8] font-normal sm:text-[4rem]">
          {score}
        </b>
        <span className="font-label text-[0.8rem] font-extrabold tracking-[0.08em] text-paper-mute">
          / {MAX_RATING}
        </span>
        <span
          aria-hidden
          className="mt-2.5 ml-auto hidden h-1 w-19 bg-ink-3 sm:block"
        >
          <span
            className="block h-full bg-paper"
            style={{ width: `${(score / MAX_RATING) * 100}%` }}
          />
        </span>
      </p>
    </article>
  );
}
