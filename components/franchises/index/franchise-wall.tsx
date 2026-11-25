import type { ReactNode } from "react";
import { fetchFranchiseTiles } from "@/lib/franchises/fetch";
import { browseHref, type BrowseQuery } from "@/lib/franchises/browse";
import { ButtonLink } from "@/components/ui/button";
import { ListPagination } from "@/components/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { BoxSetTile } from "@/components/franchises/index/box-set-tile";

const WALL =
  "grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 sm:gap-x-5.5 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

// The wall of box sets: a page of the index under its search, letter and
// sort, then the page numbers. An empty search or letter says so and
// offers the whole wall back.
export async function FranchiseBoxWall({ query }: { query: BrowseQuery }) {
  const result = await fetchFranchiseTiles(query);
  if (!result)
    return (
      <Empty>Couldn&apos;t load the Franchises. Try again in a moment.</Empty>
    );
  if (result.tiles.length === 0) {
    const narrowed = query.q || query.letter;
    return (
      <Empty>
        {query.q
          ? `No Franchise matches “${query.q}”.`
          : query.letter
            ? `No Franchise starts with ${query.letter === "#" ? "anything but a letter" : query.letter}.`
            : "No Franchises yet."}
        {narrowed && (
          <ButtonLink
            href={browseHref({ sort: query.sort })}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Show every Franchise
          </ButtonLink>
        )}
      </Empty>
    );
  }
  return (
    <div className="space-y-8">
      <ul className={WALL}>
        {result.tiles.map((tile) => (
          <li key={tile.franchise_id} className="min-w-0">
            <BoxSetTile tile={tile} />
          </li>
        ))}
      </ul>
      <ListPagination
        currentPage={query.page}
        totalPages={result.pages}
        buildHref={(page) => browseHref({ ...query, page })}
      />
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </div>
  );
}

// The wall while a page of it loads: box-set shaped blocks.
export function FranchiseWallSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading Franchises" className={WALL}>
      {Array.from({ length: 15 }, (_, i) => (
        <li key={i} className="space-y-3">
          <div className="flex aspect-[6/5] items-end justify-center pb-1.5">
            <Skeleton variant="card" className="aspect-[3/4] w-[51%]" />
          </div>
          <Skeleton variant="text" className="h-5 w-3/4" />
          <Skeleton variant="text" className="h-3 w-full" />
        </li>
      ))}
    </ul>
  );
}
