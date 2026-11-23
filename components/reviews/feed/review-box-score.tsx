import { MAX_RATING } from "@/lib/api/rating";
import type { FeedTrack } from "@/lib/reviews/feed";
import { cn } from "@/lib/utils";

// A box's monumental score in its bottom-right corner (top-right on a
// phone): a solid red block for a GOTM game, violet for an NR-GOTM one, bare
// paper numerals otherwise. A Revision strikes the score it replaced beside
// the new one.
export function ReviewBoxScore({
  rating,
  previous,
  track,
}: {
  rating: number;
  previous: number | null;
  track: FeedTrack;
}) {
  const label =
    previous != null
      ? `Rated ${rating} out of ${MAX_RATING}, was ${previous}`
      : `Rated ${rating} out of ${MAX_RATING}`;
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "font-headline absolute top-0 right-0 flex items-end gap-1.5 px-2.5 py-1 leading-none",
        "@lg:top-auto @lg:bottom-0 @lg:gap-2 @lg:px-3.5 @lg:pt-0 @lg:pb-1.5",
        track === "gotm" && "rounded-bl-[2px] bg-gotm text-gotm-foreground @lg:rounded-bl-none @lg:rounded-tl-[2px]",
        track === "nr" && "rounded-bl-[2px] bg-nr text-nr-foreground @lg:rounded-bl-none @lg:rounded-tl-[2px]",
        track === null && "text-foreground",
      )}
    >
      {previous != null && (
        <s
          className={cn(
            "mb-1.5 text-[22px] decoration-[3px] @lg:mb-3 @lg:text-[42px]",
            track === null
              ? "text-faint-foreground decoration-gotm-soft"
              : "text-current/70 decoration-current",
          )}
        >
          {previous}
        </s>
      )}
      <span className="text-[54px] leading-[0.86] @lg:text-[118px]">{rating}</span>
    </div>
  );
}
