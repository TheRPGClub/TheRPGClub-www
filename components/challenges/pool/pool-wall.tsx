import Link from "next/link";
import { filterWall, isPlayed, splitWall, type PlayedFilter, type WallTile } from "@/lib/challenges/pool-wall";
import { PoolLegend } from "@/components/challenges/pool/pool-legend";
import { PoolFilter } from "@/components/challenges/pool/pool-filter";
import { WallSection } from "@/components/challenges/pool/wall-section";

// The Pool view (surface brief challenges-pool, 2B; pick 9A, www#170): two
// walls, Core Games then Optional Games, under one filter. Each cover
// carries the marks of members who Cleared it (solid) or have it In
// Progress (a paper ring); your games carry the yellow ring, games nobody
// played sit at half strength, and an Optional Game carries a paper "New"
// (joined in the last 14 days) or "Added" (picked by hand) tag. 40 to a
// wall until "Show all".

const PAGE = 40;

export function PoolWall({
  tiles,
  filter,
  showAll,
  hrefFor,
  leftOut,
  target,
  sources,
}: {
  tiles: WallTile[];
  filter: PlayedFilter;
  showAll: boolean;
  hrefFor: (change: { played?: PlayedFilter; all?: boolean }) => string;
  leftOut: string[];
  // The Optional target, and what feeds the Optional Games ("From the Final
  // Fantasy Franchise").
  target: number;
  sources: string | null;
}) {
  const played = tiles.filter(isPlayed).length;
  const all = splitWall(tiles);
  const shown = splitWall(filterWall(tiles, filter));
  const cut = (list: WallTile[]) => (showAll ? list : list.slice(0, PAGE));
  const more = !showAll && (shown.core.length > PAGE || shown.optional.length > PAGE);
  const filterNav = (
    <PoolFilter
      filter={filter}
      hrefFor={hrefFor}
      tabs={[
        { key: "all", label: "All", count: tiles.length },
        { key: "played", label: "Played by the club", count: played },
        { key: "unplayed", label: "Not played yet", count: tiles.length - played },
      ]}
    />
  );
  const none = filter === "all" ? "None yet." : "No games here.";
  return (
    <section data-slot="pool-wall" aria-label="The Pool">
      {all.core.length === 0 && <div className="mb-5">{filterNav}</div>}
      {all.core.length > 0 && (
        <WallSection
          id="pool-core-games"
          title="Core Games"
          count={`${all.core.length} · every Run Clears all of them`}
          aside={filterNav}
          tiles={cut(shown.core)}
          empty={none}
        />
      )}
      {(all.optional.length > 0 || target > 0) && (
        <WallSection
          id="pool-optional-games"
          title="Optional Games"
          count={`${all.optional.length} · ${target > 0 ? `Clear any ${target}` : "none needed to Finish"}`}
          aside={sources}
          tiles={cut(shown.optional)}
          empty={none}
        />
      )}
      <div className="mt-[18px] flex flex-wrap items-start gap-x-6 gap-y-2">
        <p className="text-[0.85rem] text-faint-foreground">
          Showing {cut(shown.core).length + cut(shown.optional).length} of{" "}
          {shown.core.length + shown.optional.length}
          {more && (
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
        <PoolLegend />
      </div>
    </section>
  );
}
