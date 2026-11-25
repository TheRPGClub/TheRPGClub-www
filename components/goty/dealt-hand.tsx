import { ArrowLeftRight, Loader2, Trash2 } from "lucide-react";
import type { GotyNomination } from "@/lib/goty/types";
import type { GotyNominationsState } from "@/hooks/use-goty-nominations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AwardCover } from "./award-cover";

const TILT = ["-rotate-2", "rotate-[1.5deg]", "-rotate-1"];

// The viewer's three nominations dealt as cards, each at its own small
// tilt with the object lift: the cover, the title, Swap and Withdraw. An
// open slot is a dashed yellow outline with its number.
export function DealtHand({
  mine,
  year,
  state,
  open,
}: {
  mine: GotyNomination[];
  year: number;
  state: GotyNominationsState;
  open: boolean;
}) {
  return (
    <ol className="mt-1.5 grid max-w-[980px] gap-4 sm:grid-cols-2 sm:gap-6.5 lg:grid-cols-3">
      {[0, 1, 2].map((i) => {
        const n = mine[i];
        const tilt = cn("motion-safe:transition-transform", TILT[i]);
        if (!n?.game) {
          return (
            <li key={i} className={cn("flex min-h-[170px] flex-col justify-center gap-1 rounded-[3.2px] border-2 border-dashed border-highlight p-4.5", tilt)}>
              <span className="font-headline text-[2.6rem] leading-[0.8] text-highlight">0{i + 1}</span>
              <p className="font-label text-sm font-extrabold tracking-[0.08em] uppercase">Open slot</p>
              <p className="text-sm text-faint-foreground">{open ? `Pick a ${year} game below.` : "Nominations are closed."}</p>
            </li>
          );
        }
        const swapping = state.replacing?.id === n.id;
        return (
          <li
            key={n.id}
            className={cn(
              "grid grid-cols-[90px_minmax(0,1fr)] gap-3.5 rounded-[3.2px] bg-card p-3 shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:grid-cols-[120px_minmax(0,1fr)]",
              swapping && "ring-2 ring-highlight",
              tilt,
            )}
          >
            <AwardCover award="game_of_the_year" game={n.game} fallbackClassName="text-base" />
            <div className="min-w-0">
              <h3 className="font-headline text-[1.6rem] leading-[0.95] break-words">{n.game.title}</h3>
              {swapping && <p className="mt-1.5 text-[0.82rem] text-highlight">Pick the game to put in its place below.</p>}
              {open && (
                <div className="-ml-2 mt-2 flex flex-wrap gap-0.5">
                  <Button type="button" variant="ghost" size="sm" disabled={state.pending} onClick={() => (swapping ? state.cancel() : state.startReplacing(n))}>
                    <ArrowLeftRight data-icon="inline-start" />
                    {swapping ? "Keep it" : "Swap"}
                  </Button>
                  <Button type="button" variant="destructive-ghost" size="sm" disabled={state.pending} onClick={() => state.withdraw(n)}>
                    {state.pending ? <Loader2 className="motion-safe:animate-spin" /> : <Trash2 data-icon="inline-start" />}
                    Withdraw
                  </Button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
