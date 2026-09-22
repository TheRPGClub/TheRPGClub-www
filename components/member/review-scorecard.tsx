import { MAX_RATING } from "@/lib/api/rating";
import {
  facetLabel,
  isEvenSplit,
  sanitizeReviewFacets,
} from "@/lib/reviews/facets";
import { reviewAccents, type ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";

export interface ReviewScorecardProps {
  // The raw stored value; normalized here so no caller has to remember to.
  facets: unknown;
  accent?: ReviewAccent;
  // `compact` is the listing card: two columns, no chrome. `full` is the
  // review's own page.
  variant?: "compact" | "full";
  className?: string;
}

/**
 * A review's per-category scores, read-only.
 *
 * No "use client": this renders in the RSC pass like the review body does, so
 * a page listing twenty scorecards ships none of the composer.
 */
export function ReviewScorecard({
  facets,
  accent = "neutral",
  variant = "compact",
  className,
}: ReviewScorecardProps) {
  const scorecard = sanitizeReviewFacets(facets);
  // A card with nothing scored on it is a card with nothing to say. The
  // composer can hold one mid-edit; a reader should never meet it.
  if (!scorecard) return null;
  const scored = scorecard.order.filter(
    (key) => scorecard.scores[key] !== undefined,
  );
  if (scored.length === 0) return null;

  // Every card the composer writes now carries a split, so "has weights" no
  // longer means the writer chose one. Only a split they actually moved off
  // even is worth a reader's attention — the rest is a column of identical
  // percentages saying nothing.
  const weighted =
    scorecard.weights !== undefined && !isEvenSplit(scorecard);
  const full = variant === "full";

  return (
    <section className={cn(full && "space-y-4", className)}>
      {full && (
        <h2
          className={cn(
            "text-xs font-semibold tracking-[0.12em] uppercase",
            reviewAccents[accent].readout,
          )}
        >
          Scorecard
        </h2>
      )}

      <dl
        className={cn(
          full
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2",
        )}
      >
        {scored.map((key) => (
          <FacetScore
            key={key}
            label={facetLabel(key, scorecard.labels)}
            score={scorecard.scores[key]!}
            weight={weighted ? scorecard.weights?.[key] : undefined}
            accent={accent}
            full={full}
          />
        ))}
      </dl>
    </section>
  );
}

function FacetScore({
  label,
  score,
  weight,
  accent,
  full,
}: {
  // Already resolved by the caller: the reviewer's own name for the row where
  // they gave one, the catalogue's otherwise.
  label: string;
  score: number;
  // The facet's share of the weighting, on a weighted card. The shares shown
  // can total under 100 when some facets went unscored — those are left off
  // the card entirely, and out of the average with them.
  weight: number | undefined;
  accent: ReviewAccent;
  full: boolean;
}) {
  const style = reviewAccents[accent];
  const pct = Math.max(0, Math.min(100, (score / MAX_RATING) * 100));

  // `full` is a tile — a card's worth of visual weight per category, built
  // around a number big enough to actually read as a score rather than a
  // caption. `compact` stays the quiet single-line row it always was.
  if (full) {
    return (
      <div className="rounded-lg border border-border/50 bg-background/40 p-3">
        <dt className="truncate text-xs text-muted-foreground">{label}</dt>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <dd
            className={cn(
              "text-3xl leading-none font-bold tabular-nums",
              style.readout,
            )}
          >
            {score}
          </dd>
          {weight !== undefined && (
            <span
              className="text-[10px] text-muted-foreground"
              title={`${weight}% of the weighting`}
            >
              {weight}%
            </span>
          )}
        </div>
        <div
          aria-hidden
          className={cn(
            "mt-2 h-1.5 overflow-hidden rounded-full bg-linear-to-r",
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

  return (
    <div className="flex items-center gap-2.5">
      <dt className="w-24 shrink-0 truncate text-xs text-muted-foreground sm:w-28">
        {label}
      </dt>
      <div
        aria-hidden
        className={cn(
          "h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-linear-to-r",
          style.track,
        )}
      >
        <div
          className={cn("h-full rounded-full bg-linear-to-r", style.fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <dd
        className={cn(
          "w-[3ch] shrink-0 text-right text-xs font-bold tabular-nums",
          style.readout,
        )}
      >
        {score}
      </dd>
      {weight !== undefined && (
        <span
          className="w-[4ch] shrink-0 text-right text-[10px] tabular-nums text-muted-foreground"
          title={`${weight}% of the weighting`}
        >
          {weight}%
        </span>
      )}
    </div>
  );
}
