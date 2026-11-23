import { MAX_RATING } from "@/lib/api/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// The small parts every review surface shares: the reviewer's disc, the
// date, the monumental score box and the facet bars. Markup only, so they
// render on the server or inside a client list alike.

export {
  facetFill,
  scoredFacets,
  type ScoredFacet,
} from "@/components/issue/review-meta-facets";
export { FacetBars } from "@/components/issue/review-meta-facet-bars";

const API_BASE = process.env.API_URL ?? "http://localhost:3000";

export { formatReviewDate } from "@/lib/reviews/review-date";

const AVATAR_SIZE = {
  xs: "size-[18px] text-[9px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-sm",
  lg: "size-[34px] text-sm",
} as const;

// A member's Discord avatar through the API, falling back to their initial on
// an ink disc while it loads or when they have none.
export function ReviewerAvatar({
  userId,
  name,
  size = "md",
  className,
}: {
  userId: string;
  name: string;
  size?: keyof typeof AVATAR_SIZE;
  className?: string;
}) {
  return (
    <Avatar
      variant="byline"
      className={cn(
        "after:hidden",
        AVATAR_SIZE[size],
        className,
      )}
    >
      <AvatarImage
        src={`${API_BASE}/api/v1/users/${userId}/avatar`}
        alt=""
      />
      <AvatarFallback className="font-label font-extrabold text-[length:inherit]">
        {name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// The review's overall score, 0-100, as a paper block with an Anton numeral.
// Scores stay off the call-to-action yellow.
export function ScoreBox({
  rating,
  className,
}: {
  // Null only on a Draft with no score yet: the box shows a dash.
  rating: number | null;
  // Size and type size, e.g. "size-16 text-4xl".
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={rating === null ? "Not scored yet" : `Rated ${rating} out of ${MAX_RATING}`}
      className={cn(
        "font-headline grid shrink-0 place-items-center rounded-sm bg-foreground leading-none text-background",
        className,
      )}
    >
      {rating ?? "—"}
    </div>
  );
}
