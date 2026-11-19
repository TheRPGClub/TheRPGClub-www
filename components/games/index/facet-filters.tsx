import Link from "next/link";
import { fetchFacetOptions } from "@/lib/games/games-index";
import { gamesIndexHref, type WinnerFilter } from "@/lib/games/index-href";
import { anyFacet, FACETS, type Facets } from "@/lib/games/index-facets";
import { FacetFilter } from "@/components/games/index/facet-filter";

// The row of facet filters under the search, with a way back to every game
// once one is on. A facet with no options (its read failed) isn't offered.
export async function FacetFilters({
  q,
  winner,
  facets,
}: {
  q: string;
  winner: WinnerFilter;
  facets: Facets;
}) {
  const options = await fetchFacetOptions();
  return (
    <div role="group" aria-label="Filter games" className="flex flex-wrap items-center gap-2">
      {FACETS.filter(({ key }) => options[key].length > 0).map(({ key, label }) => (
        <FacetFilter
          key={key}
          facet={key}
          label={label}
          options={options[key]}
          q={q}
          winner={winner}
          facets={facets}
        />
      ))}
      {anyFacet(facets) && (
        <Link
          href={gamesIndexHref({ q, winner })}
          className="font-label ml-1 text-sm text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
        >
          Clear filters
        </Link>
      )}
    </div>
  );
}
