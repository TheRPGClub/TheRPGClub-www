import Link from "next/link";
import type { Review } from "@/lib/api/types";
import { reviewDate } from "@/lib/reviews/review-date";
import {
  ReviewerAvatar,
  formatReviewDate,
} from "@/components/issue/review-meta";
import { reviewerName } from "@/lib/reviews/reviewer-name";

// A review card's byline: the reviewer's disc and name (or, on a member's own
// list, the game), over the date.
export function ReviewCardByline({
  review,
  showUser,
  showGame,
}: {
  review: Review;
  showUser: boolean;
  showGame: boolean;
}) {
  const name = reviewerName(review.user, "A member");
  return (
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
        <small className="block text-[0.8rem] text-faint-foreground">
          {showUser && showGame && review.game && (
            <>
              <Link
                href={`/games/${review.gamedb_game_id}`}
                className="hover:text-foreground"
              >
                {review.game.title}
              </Link>
              {" · "}
            </>
          )}
          <time dateTime={reviewDate(review)}>{formatReviewDate(reviewDate(review))}</time>
        </small>
      </div>
    </div>
  );
}
