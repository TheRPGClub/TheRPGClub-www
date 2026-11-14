import {
  facetFill,
  type ScoredFacet,
} from "@/components/issue/review-meta-facets";
import { cn } from "@/lib/utils";

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
            "before:absolute before:inset-x-0 before:bottom-0 before:h-1 before:rounded-[2px] before:bg-muted",
            "after:absolute after:bottom-0 after:left-0 after:h-1 after:w-(--fill) after:rounded-[2px]",
            facet.score === best ? "after:bg-foreground" : "after:bg-faint-foreground/60",
          )}
        >
          <dt className="font-label truncate text-[0.84rem] tracking-[0.05em] text-dim-foreground">
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
