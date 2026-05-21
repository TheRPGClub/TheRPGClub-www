import Link from "next/link";
import { Star } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { cn } from "@/lib/utils";

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
}

export function MemberReviewCard({
  review,
  hideUser,
  hideGame,
  showFullBody,
  trailing,
  className,
}: MemberReviewCardProps) {
  const user = review.user;
  const game = review.game;
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

      <ReviewRating rating={review.rating} />

      {review.body ? (
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            !showFullBody && "line-clamp-4",
          )}
        >
          {review.body}
        </p>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          No written review.
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

// Rating is stored as integer 0..100; render as 5 stars by scaling.
const RATING_TO_STARS = 1 / 20;

export function ReviewRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined) {
    return (
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        No rating
      </p>
    );
  }
  const stars = Math.round(rating * RATING_TO_STARS);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${stars} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < stars
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
