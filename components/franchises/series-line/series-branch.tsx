import Link from "next/link";
import type { FranchiseEntry } from "@/lib/franchises/page";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";
import { AddOnStops } from "@/components/franchises/series-line/add-on-stops";

// The Spin-offs on the Series Line: a thinner branch rail in release order,
// each Spin-off a small stop over its cover, name and year, its Add-ons as
// yellow tags. The branch comes off the Mainline from above (`branch`);
// a Franchise with no Mainline draws it as the only line. On a phone it runs
// down the page like the Mainline.
export function SeriesBranch({ entries, branch }: { entries: FranchiseEntry[]; branch: boolean }) {
  return (
    <section aria-label="Spin-offs, in release order" className={cn(branch && "mt-8 @xl/line:mt-10 @xl/line:pl-6")}>
      <p className="font-label mb-3 text-[0.74rem] text-faint-foreground @xl/line:mb-1 @xl/line:ml-6">Spin-offs</p>
      <ol className="grid @xl/line:grid-cols-6 @xl/line:gap-y-6 @3xl/line:grid-cols-9 @5xl/line:grid-cols-12">
        {entries.map((e, i) => (
          <Spinoff key={e.game_id} entry={e} first={i === 0} last={i === entries.length - 1} branch={branch} />
        ))}
      </ol>
    </section>
  );
}

function Spinoff({ entry, first, last, branch }: { entry: FranchiseEntry; first: boolean; last: boolean; branch: boolean }) {
  return (
    <li className="relative grid grid-cols-[1.75rem_2.5rem_minmax(0,1fr)] gap-x-3 pb-4 @xl/line:flex @xl/line:flex-col @xl/line:items-center @xl/line:pb-0">
      <span aria-hidden className="absolute inset-y-0 left-0 w-7 @xl/line:hidden">
        {!(first && last) && (
          <span data-slot="series-branch-rail" className={cn("absolute left-1/2 w-[3px] -translate-x-1/2 bg-dim-foreground", first ? "top-6.5" : "top-0", last ? "h-6.5" : "bottom-0")} />
        )}
        <Stop className="top-6.5" />
      </span>
      <span aria-hidden className="relative hidden h-5 w-full @xl/line:block">
        <span data-slot="series-branch-rail" className={cn("absolute top-[8.5px] h-[3px] bg-dim-foreground", first ? "left-1/2" : "-left-px", last ? "right-1/2" : "-right-px")} />
        {first && branch && (
          <span className="absolute right-1/2 bottom-[8.5px] h-9 w-[calc(50%+1.5rem)] rounded-bl-[12px] border-b-3 border-l-3 border-dim-foreground" />
        )}
        <Stop className="top-1/2" />
      </span>
      <Link
        href={`/games/${entry.game_id}`}
        className="col-start-2 row-span-2 row-start-1 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-highlight max-@xl/line:after:absolute max-@xl/line:after:inset-0 @xl/line:mt-1.5 @xl/line:w-[64%]"
      >
        <GameCover title={entry.title} coverUrl={entry.cover_url} alt={entry.title} className="w-full" fallbackClassName="p-1 text-[0.62rem]" />
      </Link>
      <p className="font-label col-start-3 row-start-1 mt-1 text-[0.82rem] leading-[1.12] @xl/line:mt-1.5 @xl/line:w-full @xl/line:px-1 @xl/line:text-center @xl/line:text-[0.7rem]">
        <span aria-hidden className="line-clamp-2">{entry.title}</span>
        <small className="block text-[0.72rem] text-faint-foreground">{entry.release_year ?? "TBA"}</small>
      </p>
      <AddOnStops games={entry.addOns} parent={entry.title} look="tags" className="col-start-3 row-start-2 @xl/line:w-full @xl/line:px-1" />
    </li>
  );
}

function Stop({ className }: { className?: string }) {
  return (
    <span data-slot="series-branch-stop" className={cn("absolute left-1/2 z-[1] size-[11px] -translate-1/2 rounded-full border-[2.5px] border-dim-foreground bg-background", className)} />
  );
}
