import Link from "next/link";
import type { FranchiseLayout } from "@/lib/franchises/page";
import { SeriesStation } from "@/components/franchises/series-line/series-station";
import { SeriesBranch } from "@/components/franchises/series-line/series-branch";
import { AddOnStops } from "@/components/franchises/series-line/add-on-stops";

// The Games view as The Series Line (spec api#487, pick page-line.html):
// the Mainline as numbered stations on a paper rail, the Spin-offs on a
// branch line, Add-ons as yellow stops off their parent, then the Add-ons
// of games outside the Franchise. A key at the top names the three marks.
// The view is a container (`line`): its width, not the screen's, decides
// how many stations a row holds, and under the first step the line runs
// down the page. Reading order is release order, Mainline then Spin-offs.
export function SeriesLine({ layout }: { layout: FranchiseLayout }) {
  const { mainline, other, strays } = layout;
  if (mainline.length + other.length + strays.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border-strong px-4 py-6 text-dim-foreground">
        No games are linked to this Franchise yet.
      </p>
    );
  }
  return (
    <div className="@container/line">
      <Key mainline={mainline.length > 0} spinoffs={other.length > 0} addOns={layout.counts.addOns > 0} />
      {mainline.length > 0 && (
        <ol aria-label="Mainline, in release order" className="grid @xl/line:grid-cols-4 @xl/line:gap-y-12 @xl/line:pr-12 @xl/line:pl-6 @3xl/line:grid-cols-6 @5xl/line:grid-cols-8">
          {mainline.map((e, i) => (
            <SeriesStation key={e.game_id} entry={e} index={i} total={mainline.length} next={mainline[i + 1]?.numeral} />
          ))}
        </ol>
      )}
      {other.length > 0 && <SeriesBranch entries={other} branch={mainline.length > 0} />}
      {strays.length > 0 && (
        <section aria-label="Add-ons of games outside this Franchise" className="mt-10">
          <p className="font-label mb-3 text-[0.74rem] text-faint-foreground">Add-ons of games outside this Franchise</p>
          <ul className="grid gap-x-6 gap-y-5 @xl/line:grid-cols-2 @3xl/line:grid-cols-3 @5xl/line:grid-cols-4">
            {strays.map((group, i) => (
              <li key={group.parent?.game_id ?? `none-${i}`} className="min-w-0">
                <p className="font-label mb-2 flex items-center gap-2 text-[0.84rem]">
                  <span aria-hidden className="size-[11px] shrink-0 rounded-full border-[2.5px] border-dim-foreground" />
                  {group.parent ? (
                    <Link href={`/games/${group.parent.game_id}`} className="truncate underline decoration-gotm decoration-2 underline-offset-3 hover:text-highlight">
                      {group.parent.title}
                    </Link>
                  ) : (
                    <span className="text-dim-foreground">A game not in GameDB</span>
                  )}
                </p>
                <AddOnStops games={group.games} parent={group.parent?.title ?? "a game not in GameDB"} className="pl-px" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Key({ mainline, spinoffs, addOns }: { mainline: boolean; spinoffs: boolean; addOns: boolean }) {
  return (
    <p aria-hidden className="font-label mb-5 flex flex-wrap justify-end gap-x-5 gap-y-1 text-[0.72rem] text-dim-foreground">
      {mainline && (
        <span className="flex items-center gap-2"><i data-slot="series-key" data-variant="mainline" className="h-1.5 w-5 bg-foreground" />Mainline</span>
      )}
      {spinoffs && (
        <span className="flex items-center gap-2"><i data-slot="series-key" data-variant="spin-off" className="h-[3px] w-5 bg-dim-foreground" />Spin-off</span>
      )}
      {addOns && (
        <span className="flex items-center gap-2"><i data-slot="series-key" data-variant="add-on" className="size-2.5 bg-highlight" />Add-on</span>
      )}
    </p>
  );
}
