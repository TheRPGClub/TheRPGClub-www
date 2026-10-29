import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { SectionHeading } from "@/components/issue/page-header";
import {
  ScoreBox,
  formatReviewDate,
  reviewerName,
} from "@/components/issue/review-meta";
import { buttonVariants } from "@/components/ui/button";

// "More from the club": the game's other reviews as small cards, then the way
// back to the reviews list and the game. Closes a review's page.
export function ReviewMore({
  gameId,
  gameTitle,
  others,
  otherCount,
}: {
  gameId: number;
  gameTitle: string;
  // A few of the game's other reviews, newest first.
  others: Review[];
  // How many other reviews the game has in all.
  otherCount: number;
}) {
  return (
    <section
      aria-labelledby={others.length ? "more-from-the-club" : undefined}
      aria-label={others.length ? undefined : "Back to the game"}
      className="space-y-4"
    >
      {others.length > 0 && (
        <>
          <SectionHeading
            title={<span id="more-from-the-club">More from the club</span>}
            count={`${otherCount} other ${otherCount === 1 ? "review" : "reviews"} of ${gameTitle}`}
          />
          <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            {others.map((review) => {
              const name = reviewerName(review.user, "A member");
              return (
                <li key={review.review_id}>
                  <Link
                    href={`/games/${gameId}/reviews/${review.review_id}`}
                    className="group/mc flex h-full flex-col gap-2.5 rounded-md bg-ink-2 p-4 ring-1 ring-rule transition-shadow ring-inset hover:ring-paper-mute"
                  >
                    <span className="flex items-center gap-2.5">
                      <ScoreBox
                        rating={review.rating}
                        className="size-12 text-[1.7rem]"
                      />
                      <span className="min-w-0 leading-tight">
                        <b className="block truncate text-sm font-semibold">
                          {name}
                        </b>
                        <small className="text-[0.8rem] text-paper-mute">
                          {formatReviewDate(review.created_at)}
                        </small>
                      </span>
                    </span>
                    <span className="font-label text-base leading-[1.15] font-extrabold tracking-[0.01em] transition-colors group-hover/mc:text-highlight">
                      {review.title ?? `${name}'s review`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <nav
        aria-label="Back"
        className="flex flex-col justify-center gap-2.5 pt-2 sm:flex-row"
      >
        <Link
          href={`/games/${gameId}/reviews`}
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft data-icon="inline-start" />
          All reviews
        </Link>
        <Link
          href={`/games/${gameId}`}
          className={buttonVariants({ variant: "outline" })}
        >
          {gameTitle}
          <ArrowRight data-icon="inline-end" />
        </Link>
      </nav>
    </section>
  );
}
