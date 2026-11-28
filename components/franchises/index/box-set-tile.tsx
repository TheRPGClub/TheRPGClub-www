import Link from "next/link";
import {
  progressPercent,
  tileCounts,
  yearSpan,
  type FranchiseTile,
} from "@/lib/franchises/browse";
import { Progress } from "@/components/ui/progress";
import { BoxSetFan } from "@/components/franchises/index/box-set-fan";
import { BoxSetTag } from "@/components/franchises/index/box-set-tag";
import { CountLine } from "@/components/franchises/index/count-line";

// A Franchise on the /franchises wall: its fanned box set, the name in
// Anton on a 2px paper rule, its counts and years in label caps, and the
// viewer's "You x/y" Mainline bar where Franchise Progress is open to them.
// The whole tile is the link. Hovered or focused it lifts, its name and
// middle cover take the yellow, and it hangs the paper tag.
export function BoxSetTile({ tile }: { tile: FranchiseTile }) {
  const years = yearSpan(tile);
  return (
    <Link
      href={`/franchises/${tile.franchise_id}`}
      data-slot="franchise-tile"
      className="group/tile relative block min-w-0 rounded-xs outline-offset-4 hover:z-10 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-highlight motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-1.5 motion-safe:focus-visible:-translate-y-1.5"
    >
      <BoxSetFan tile={tile} />
      <h3 data-slot="franchise-tile-name" className="font-headline truncate border-b-2 border-foreground pt-3 pb-1.5 text-[1.2rem] leading-none transition-colors group-hover/tile:text-highlight group-focus-visible/tile:text-highlight sm:text-[1.45rem]">
        {tile.name}
      </h3>
      <p className="font-label mt-2 text-[0.74rem] leading-[1.2] font-bold tracking-[0.08em] text-dim-foreground">
        <CountLine parts={tileCounts(tile)} />
        <span className="sr-only">, {tile.spin_off_count} Spin-offs</span>
      </p>
      {years && (
        <p className="font-label mt-0.5 text-[0.74rem] leading-[1.2] font-bold tracking-[0.08em] text-faint-foreground">
          {years}
        </p>
      )}
      {tile.progress && (
        <div className="font-label mt-2 flex items-center gap-2 text-[0.74rem] leading-none font-extrabold tracking-[0.08em] text-highlight">
          <span>
            You {tile.progress.done}/{tile.progress.total}
          </span>
          <Progress
            tone="highlight"
            value={progressPercent(tile.progress)}
            aria-label={`Your Mainline: ${tile.progress.done} of ${tile.progress.total}`}
            className="flex-1"
          />
        </div>
      )}
      <BoxSetTag tile={tile} />
    </Link>
  );
}
