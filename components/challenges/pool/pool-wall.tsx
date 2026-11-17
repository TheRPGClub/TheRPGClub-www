import Link from "next/link";
import { filterWall, isPlayed, type PlayedFilter, type WallTile } from "@/lib/challenges/pool-wall";
import { cn } from "@/lib/utils";
import { WallTileCover } from "@/components/challenges/pool/wall-tile";
import { PoolLegend } from "@/components/challenges/pool/pool-legend";

// The Pool view (surface brief challenges-pool, 2B): a filter, then the
// Pool's covers at 3:4, each with the marks of members who Cleared it (solid)
// or have it In Progress (a paper ring). Your games carry the yellow ring,
// games nobody played sit at half strength, and a game the Host added by hand
// carries a paper "Added" tag. 40 to a page until "Show all".

const PAGE = 40;

export function PoolWall({
  tiles,
  filter,
  showAll,
  hrefFor,
  leftOut,
}: {
  tiles: WallTile[];
  filter: PlayedFilter;
  showAll: boolean;
  hrefFor: (change: { played?: PlayedFilter; all?: boolean }) => string;
  leftOut: string[];
}) {
  const played = tiles.filter(isPlayed).length;
  const shown = filterWall(tiles, filter);
  const visible = showAll ? shown : shown.slice(0, PAGE);
  const tabs: { key: PlayedFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: tiles.length },
    { key: "played", label: "Played by the club", count: played },
    { key: "unplayed", label: "Not played yet", count: tiles.length - played },
  ];
  return (
    <section aria-label="The Pool">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <nav aria-label="Played" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="inline-flex rounded-sm shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <Link
                  href={hrefFor({ played: tab.key, all: false })}
                  scroll={false}
                  aria-current={tab.key === filter ? "page" : undefined}
                  className={cn(
                    "font-label inline-flex h-[34px] items-center gap-1.5 rounded-sm px-3.5 text-[0.88rem] tracking-[0.08em] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-highlight",
                    tab.key === filter
                      ? "bg-foreground text-background"
                      : "text-faint-foreground hover:text-foreground",
                  )}
                >
                  {tab.label} <span>{tab.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <PoolLegend />
      </div>
      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">
          No games here.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-3.5 gap-y-[18px] sm:grid-cols-5 lg:grid-cols-8 2xl:grid-cols-10">
          {visible.map((tile) => (
            <WallTileCover key={tile.game.game_id} tile={tile} />
          ))}
        </ul>
      )}
      <p className="mt-[18px] text-[0.85rem] text-faint-foreground">
        Showing {visible.length} of {shown.length}
        {!showAll && shown.length > PAGE && (
          <>
            {" · "}
            <Link
              href={hrefFor({ played: filter, all: true })}
              scroll={false}
              className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
            >
              Show all
            </Link>
          </>
        )}
        {leftOut.length > 0 && ` · Left out by the Host: ${leftOut.join(", ")}`}
      </p>
    </section>
  );
}
