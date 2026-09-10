import { MAX_RATING } from "@/lib/api/rating";
import {
  facetAverage,
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
  // The review's overall score. Given, the footer can point out where the
  // reviewer's verdict parts company with their own arithmetic — which is
  // usually worth reading the review for.
  overall?: number | null;
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
  overall,
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

  const average = facetAverage(scorecard);
  // Every card the composer writes now carries a split, so "has weights" no
  // longer means the writer chose one. Only a split they actually moved off
  // even is worth a reader's attention — the rest is a column of identical
  // percentages saying nothing.
  const weighted =
    scorecard.weights !== undefined && !isEvenSplit(scorecard);
  const full = variant === "full";

  return (
    <section className={cn(full && "space-y-3", className)}>
      {full && (
        <h2 className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Scorecard
        </h2>
      )}

      <dl
        className={cn(
          full
            ? "grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2"
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

      {full && average !== null && (
        <p className="border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
          {weighted ? "These weigh out to " : "These average "}
          <span className="font-semibold tabular-nums">{average}</span>
          {typeof overall === "number" && overall !== average ? (
            <>
              , against an overall of{" "}
              <span className="font-semibold tabular-nums">{overall}</span>.
            </>
          ) : (
            "."
          )}
        </p>
      )}
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

  return (
    <div className="flex items-center gap-2.5">
      <dt
        className={cn(
          "shrink-0 truncate text-muted-foreground",
          full ? "w-32 text-sm" : "w-24 text-xs sm:w-28",
        )}
      >
        {label}
      </dt>
      <div
        aria-hidden
        className={cn(
          "min-w-0 flex-1 overflow-hidden rounded-full bg-linear-to-r",
          full ? "h-1.5" : "h-1",
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
          "w-[3ch] shrink-0 text-right font-semibold tabular-nums",
          full ? "text-sm" : "text-xs",
          style.readout,
        )}
      >
        {score}
      </dd>
      {weight !== undefined && (
        <span
          className={cn(
            "w-[4ch] shrink-0 text-right tabular-nums text-muted-foreground",
            full ? "text-xs" : "text-[10px]",
          )}
          title={`${weight}% of the weighting`}
        >
          {weight}%
        </span>
      )}
    </div>
  );
}
