import {
  facetFill,
  type ScoredFacet,
} from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";

// The verdict's facet scores: big numerals over their labels and weights,
// each with its bar; the best facet in paper.
export function ReviewVerdictFacets({ facets }: { facets: ScoredFacet[] }) {
  const best = facets.length ? Math.max(...facets.map((f) => f.score)) : null;
  const weighted = facets.some((f) => f.weight !== undefined);
  return (
    <dl className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 xl:grid-cols-5">
      {facets.map((facet) => (
        <div
          key={facet.key}
          style={{ "--fill": facetFill(facet.score) } as React.CSSProperties}
          className={cn(
            "relative flex flex-col border-t border-border pt-3 pb-4",
            "before:absolute before:inset-x-0 before:bottom-1 before:h-1 before:rounded-[2px] before:bg-muted",
            "after:absolute after:bottom-1 after:left-0 after:h-1 after:w-(--fill) after:rounded-[2px]",
            facet.score === best ? "after:bg-foreground" : "after:bg-faint-foreground/60",
          )}
        >
          <dt className="font-label order-2 mt-1 text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground">
            {facet.label}
            {weighted && facet.weight !== undefined && (
              <span className="ml-1.5 font-bold text-faint-foreground/80">
                {facet.weight}%
              </span>
            )}
          </dt>
          <dd
            className={cn(
              "font-headline order-1 text-[2.4rem] leading-[0.9] md:text-[2.9rem]",
              facet.score === best ? "text-foreground" : "text-dim-foreground",
            )}
          >
            {facet.score}
          </dd>
        </div>
      ))}
    </dl>
  );
}
