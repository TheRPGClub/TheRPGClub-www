import dynamic from "next/dynamic";
import Link from "next/link";
import type { Review } from "@/lib/api/types";
import { MAX_RATING } from "@/lib/api/rating";
import {
  accentForGame,
  reviewAccents,
  type ReviewAccent,
} from "@/lib/reviews/accent";
import { reviewBodyPreview } from "@/lib/api/review-body";
import { cn } from "@/lib/utils";

// Only the full-body view needs the rich renderer, and the listing views
// (which are the common case) render a plain-text preview instead. A static
// import would still put the renderer in the client bundle of every route
// that reaches this card through a client component — game pages do. No
// `ssr: false`: this stays server-prerendered, it is just code-split.
const ReviewBodyContent = dynamic(() =>
  import("./review-body").then((m) => ({ default: m.ReviewBodyContent })),
);

const API_BASE = process.env.API_URL ?? "http://localhost:3000";

export interface MemberReviewCardProps {
  review: Review;
  // When true, hides the user line (we're on the member profile already).
  // When false, shows it (we're on a game page).
  hideUser?: boolean;
  hideGame?: boolean;
  showFullBody?: boolean;
  trailing?: React.ReactNode;
  className?: string;
  // Overrides the hue derived from the review's own game. Game pages pass it
  // because their reviews may not embed the game; member pages leave it off
  // so each row takes its own game's colour.
  accent?: ReviewAccent;
}

export function MemberReviewCard({
  review,
  hideUser,
  hideGame,
  showFullBody,
  trailing,
  className,
  accent,
}: MemberReviewCardProps) {
  const user = review.user;
  const game = review.game;
  // Doubles as the empty check: a body with no text has no preview either.
  // The clamped card renders this plain text rather than the real markup —
  // line-clamp can't measure rich blocks reliably, and a spoiler has to stay
  // redacted where there is nothing to click.
  const preview = reviewBodyPreview(review.body);
  const userName = user
    ? (user.global_name ?? user.username ?? user.user_id)
    : null;
  const reviewHref = game
    ? `/games/${game.game_id ?? review.gamedb_game_id}`
    : null;
  const fullReviewHref = `/games/${review.gamedb_game_id}/reviews/${review.review_id}`;

  return (
    <article
      className={cn(
        "space-y-3 rounded-xl border bg-card p-4 shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {!hideUser && user && (
            <Link
              href={`/members/${user.user_id}`}
              className="flex items-center gap-2 min-w-0 hover:underline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}/api/v1/users/${user.user_id}/avatar`}
                alt={userName ?? ""}
                className="size-7 shrink-0 rounded-full"
              />
              <span className="truncate text-sm font-medium">{userName}</span>
            </Link>
          )}
          {!hideGame && game && (
            <Link
              href={reviewHref ?? `/games/${review.gamedb_game_id}`}
              className={cn(
                "truncate text-sm",
                !hideUser && "text-muted-foreground",
              )}
            >
              {!hideUser && "· "}
              <span className="font-medium">{game.title}</span>
            </Link>
          )}
        </div>
        {trailing}
      </header>

      <ReviewRating
        rating={review.rating}
        accent={accent ?? accentForGame(review.game)}
      />

      {preview === null ? (
        <p className="text-sm italic text-muted-foreground">
          No written review.
        </p>
      ) : showFullBody ? (
        <ReviewBodyContent body={review.body} />
      ) : (
        <p className="line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap">
          {preview}
        </p>
      )}

      <footer className="flex items-center justify-between text-xs text-muted-foreground">
        <time dateTime={review.created_at}>
          {new Date(review.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
        {!showFullBody && (
          <Link
            href={fullReviewHref}
            className="font-medium hover:text-foreground transition-colors"
          >
            Read more →
          </Link>
        )}
      </footer>
    </article>
  );
}

export function ReviewRating({
  rating,
  accent = "neutral",
}: {
  rating: number | null;
  accent?: ReviewAccent;
}) {
  if (rating === null || rating === undefined) {
    return <p className="text-sm text-muted-foreground">No rating</p>;
  }

  const style = reviewAccents[accent];
  // Shown as the score it is rather than scaled into stars, which rounded a
  // 0..100 rating into five buckets and lost most of it. The ramp is the same
  // one the composer uses, so a score reads the same wherever it appears.
  const pct = Math.max(0, Math.min(100, (rating / MAX_RATING) * 100));

  return (
    <div
      className="flex items-center gap-2"
      aria-label={`Rated ${rating} out of ${MAX_RATING}`}
    >
      <span
        className={cn("text-sm font-semibold tabular-nums", style.readout)}
      >
        {rating}
      </span>
      <span className="text-xs text-muted-foreground">/ {MAX_RATING}</span>
      <div
        aria-hidden
        className={cn(
          "h-1 w-20 overflow-hidden rounded-full bg-linear-to-r",
          style.track,
        )}
      >
        <div
          className={cn("h-full rounded-full bg-linear-to-r", style.fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
