import type { WallTile } from "@/lib/challenges/pool-wall";
import { WallTileCover } from "@/components/challenges/pool/wall-tile";

// One wall of the Pool view (pick 9A): its heading in Anton on a hairline
// rule, with its count and what it asks ("14 · every Run Clears all of
// them"), something at the right (the filter, or where the Optional Games
// come from), then its covers.
export function WallSection({
  id,
  title,
  count,
  aside,
  tiles,
  empty,
}: {
  id: string;
  title: string;
  count: string;
  aside?: React.ReactNode;
  tiles: WallTile[];
  empty: string;
}) {
  return (
    <section aria-labelledby={id} className="mt-7 first:mt-0">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-strong pb-2">
        <h3 id={id} className="font-headline text-[1.75rem] leading-none">
          {title}
        </h3>
        <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{count}</span>
        {aside && <div className="max-w-full min-w-0 text-[0.88rem] text-faint-foreground sm:ml-auto">{aside}</div>}
      </div>
      {tiles.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-3.5 text-faint-foreground">{empty}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-3.5 gap-y-[18px] sm:grid-cols-5 lg:grid-cols-8 2xl:grid-cols-10">
          {tiles.map((tile) => (
            <WallTileCover key={tile.game.game_id} tile={tile} />
          ))}
        </ul>
      )}
    </section>
  );
}
