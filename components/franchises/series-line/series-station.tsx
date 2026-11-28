import Link from "next/link";
import type { FranchiseEntry } from "@/lib/franchises/page";
import { LINE_WIDTHS, lineBreaks } from "@/lib/franchises/series-line";
import { cn } from "@/lib/utils";
import { GameCover } from "@/components/issue/game-cover";
import { AddOnStops } from "@/components/franchises/series-line/add-on-stops";

// Where each width step shows a row's wrap (the classes spelled out whole so
// Tailwind sees them), in LINE_WIDTHS order.
const AT_STEP = ["@xl/line:@max-3xl/line:block", "@3xl/line:@max-5xl/line:block", "@5xl/line:block"];

// One Mainline station: the Roman numeral and year over the cover (a link
// to the game), the station's stop on the paper rail, and its Add-ons
// hanging below. From the first width step the stations sit in rows; a row
// that runs on turns down at its end ("On to IX") and the next row comes in
// from above. On a phone the rail runs down the left of each station.
export function SeriesStation({ entry, index, total, next }: { entry: FranchiseEntry; index: number; total: number; next?: string | null }) {
  const first = index === 0;
  const last = index === total - 1;
  const breaks = LINE_WIDTHS.map((w) => lineBreaks(index, total, w.cols));
  const show = (key: "end" | "start") => breaks.map((b, i) => b[key] && AT_STEP[i]);
  return (
    <li className="relative grid grid-cols-[1.75rem_3.5rem_minmax(0,1fr)] gap-x-3 pb-6 @xl/line:flex @xl/line:flex-col @xl/line:items-center @xl/line:pb-0">
      <p className="col-start-3 row-start-1 flex items-baseline gap-2 @xl/line:w-[72%] @xl/line:justify-between">
        <b className="font-headline text-[1.5rem] leading-none font-normal @xl/line:text-[1.3rem] @5xl/line:text-[1.45rem]">{entry.numeral}</b>
        <span className="font-label text-[0.78rem] text-faint-foreground">{entry.release_year ?? "TBA"}</span>
      </p>
      <Link
        href={`/games/${entry.game_id}`}
        className="col-start-2 row-span-3 row-start-1 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-highlight max-@xl/line:after:absolute max-@xl/line:after:inset-0 @xl/line:mt-1 @xl/line:w-[72%]"
      >
        <GameCover title={entry.title} coverUrl={entry.cover_url} alt={entry.title} className="w-full shadow-md" fallbackClassName="p-1.5 text-[0.8rem] @3xl/line:text-[0.95rem]" />
      </Link>
      <p aria-hidden className="col-start-3 row-start-2 mt-0.5 line-clamp-2 text-[0.95rem] leading-tight text-dim-foreground @xl/line:hidden">
        {entry.title}
      </p>
      {/* The phone's rail: down the left column, the stop beside the cover. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-7 @xl/line:hidden">
        {!(first && last) && (
          <span data-slot="series-rail" className={cn("absolute left-1/2 w-1.5 -translate-x-1/2 bg-foreground", first ? "top-9.5" : "top-0", last ? "h-9.5" : "bottom-0")} />
        )}
        <Stop className="top-9.5 left-1/2" />
      </span>
      {/* From the first width step: the rail across the row. */}
      <span aria-hidden className="relative hidden h-6 w-full @xl/line:block">
        <span data-slot="series-rail" className={cn("absolute top-[9px] h-1.5 bg-foreground", first ? "left-0" : "-left-px", last ? "right-[22%]" : "-right-px")} />
        {first && <span data-slot="series-rail-end" className="absolute top-[3px] left-0 h-[18px] w-1.5 bg-foreground" />}
        {last && <span data-slot="series-rail-end" className="absolute top-[3px] right-[22%] h-[18px] w-1.5 bg-foreground" />}
        <span data-slot="series-rail-turn" className={cn("absolute top-[9px] left-full hidden h-10 w-7 rounded-tr-[18px] border-t-6 border-r-6 border-foreground", ...show("end"))} />
        <span className={cn("font-label absolute top-[54px] left-full -ml-5 hidden w-12 text-right text-[0.7rem] leading-[1.1] text-faint-foreground", ...show("end"))}>
          On to <span className="block text-foreground">{next}</span>
        </span>
        <span data-slot="series-rail-turn" className={cn("absolute right-full bottom-[9px] hidden h-14 w-3.5 rounded-bl-[14px] border-b-6 border-l-6 border-foreground", ...show("start"))} />
        <Stop className="top-1/2 left-1/2" />
      </span>
      {entry.addOns.length > 0 && (
        <div className="col-start-3 row-start-3 mt-2 @xl/line:relative @xl/line:mt-0 @xl/line:w-full @xl/line:pr-1 @xl/line:pl-1">
          <span aria-hidden className="absolute top-[-6px] right-1/2 left-[8.75px] hidden h-3 rounded-br-md border-r-[2.5px] border-b-[2.5px] border-highlight @xl/line:block" />
          <AddOnStops games={entry.addOns} parent={entry.title} className="@xl/line:pt-3" />
        </div>
      )}
    </li>
  );
}

function Stop({ className }: { className?: string }) {
  return <span data-slot="series-stop" className={cn("absolute z-[1] size-[18px] -translate-1/2 rounded-full border-4 border-foreground bg-background", className)} />;
}
