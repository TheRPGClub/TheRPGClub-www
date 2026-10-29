import { MAX_RATING } from "@/lib/api/rating";
import type { User } from "@/lib/api/types";
import {
  facetLabel,
  isEvenSplit,
  sanitizeReviewFacets,
} from "@/lib/reviews/facets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// The small parts every review surface shares: the reviewer's disc, the
// date, the monumental score box and the facet bars. Markup only, so they
// render on the server or inside a client list alike.

const API_BASE = process.env.API_URL ?? "http://localhost:3000";

export function reviewerName(
  user: Pick<User, "global_name" | "username"> | null | undefined,
  fallback: string,
): string {
  return user?.global_name ?? user?.username ?? fallback;
}

export function formatReviewDate(
  iso: string,
  month: "short" | "long" = "short",
): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month,
    day: "numeric",
  });
}

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
      <AvatarFallback className="font-label bg-ink-3 font-extrabold text-[length:inherit] text-paper">
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
  rating: number;
  // Size and type size, e.g. "size-16 text-4xl".
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Rated ${rating} out of ${MAX_RATING}`}
      className={cn(
        "font-headline grid shrink-0 place-items-center rounded-sm bg-paper leading-none text-ink",
        className,
      )}
    >
      {rating}
    </div>
  );
}

export interface ScoredFacet {
  key: string;
  label: string;
  score: number;
  // The facet's share of a weighted card, when the writer moved it off even.
  weight?: number;
}

// The scored facets of a stored scorecard, in the writer's order. Empty for a
// review without one, which is every review from before scorecards existed.
export function scoredFacets(facets: unknown): ScoredFacet[] {
  const card = sanitizeReviewFacets(facets);
  if (!card) return [];
  // Every card the composer writes carries a split; only one the writer
  // moved off even says anything worth showing.
  const weighted = card.weights !== undefined && !isEvenSplit(card);
  return card.order.flatMap((key) => {
    const score = card.scores[key];
    if (score === undefined) return [];
    return [
      {
        key,
        label: facetLabel(key, card.labels),
        score,
        weight: weighted ? card.weights?.[key] : undefined,
      },
    ];
  });
}

// A score's share of the bar, as a CSS length.
export function facetFill(score: number): string {
  return `${Math.max(0, Math.min(100, (score / MAX_RATING) * 100))}%`;
}

// Facet rows: label and Anton value on a line, a bar under them. The card's
// best facet (or facets, on a tie) gets the paper bar; the rest stay grey.
export function FacetBars({
  facets,
  limit,
  className,
  valueClassName = "text-xl",
}: {
  facets: ScoredFacet[];
  // Cards show only the first few; the review itself shows them all.
  limit?: number;
  // The list's own columns and gaps (gap-2 when absent), e.g.
  // "grid-cols-3 gap-5".
  className?: string;
  valueClassName?: string;
}) {
  if (facets.length === 0) return null;
  const best = Math.max(...facets.map((f) => f.score));
  const shown = limit ? facets.slice(0, limit) : facets;
  return (
    <dl className={cn("grid", className ?? "gap-2")}>
      {shown.map((facet) => (
        // The bar is drawn by the row itself (a track and a fill as
        // pseudo-elements), so the definition list holds only dt and dd.
        <div
          key={facet.key}
          style={{ "--fill": facetFill(facet.score) } as React.CSSProperties}
          className={cn(
            "relative grid grid-cols-[1fr_auto] items-baseline gap-x-2.5 pb-2.5",
            "before:absolute before:inset-x-0 before:bottom-0 before:h-1 before:rounded-[2px] before:bg-ink-3",
            "after:absolute after:bottom-0 after:left-0 after:h-1 after:w-(--fill) after:rounded-[2px]",
            facet.score === best ? "after:bg-paper" : "after:bg-paper-mute/60",
          )}
        >
          <dt className="font-label truncate text-[0.84rem] tracking-[0.05em] text-paper-dim">
            {facet.label}
          </dt>
          <dd className={cn("font-headline leading-none", valueClassName)}>
            {facet.score}
          </dd>
        </div>
      ))}
    </dl>
  );
}
