import { ArrowLeftRight, Loader2, Trash2 } from "lucide-react";
import { nominationGame } from "@/lib/goty/awards";
import type { GotyNomination } from "@/lib/goty/types";
import type { GotyNominationsState } from "@/hooks/use-goty-nominations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AwardCover } from "./award-cover";

// The viewer's three nominations dealt as cards with the object lift: the
// cover, the title, Swap and Withdraw. An open slot (data-state "open") is
// a dashed outline in the highlight with its number. Each Theme draws the
// cards by their slot; the Monthly Issue deals each at its own small tilt.
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
    <ol data-slot="dealt-hand" className="mt-1.5 grid max-w-[980px] gap-4 sm:grid-cols-2 sm:gap-6.5 lg:grid-cols-3">
      {[0, 1, 2].map((i) => {
        const n = mine[i];
        if (!n) {
          return (
            <li key={i} data-slot="dealt-card" data-state="open" className="flex min-h-[170px] flex-col justify-center gap-1 border-2 border-dashed border-highlight p-4.5 motion-safe:transition-transform">
              <span data-slot="dealt-card-number" className="font-headline text-[2.6rem] leading-[0.8] text-highlight">0{i + 1}</span>
              <p className="font-label text-sm font-extrabold tracking-[0.08em] uppercase">Open slot</p>
              <p className="text-sm text-faint-foreground">{open ? `Pick a ${year} game below.` : "Nominations are closed."}</p>
            </li>
          );
        }
        const swapping = state.replacing?.id === n.id;
        const game = nominationGame(n);
        return (
          <li
            key={n.id}
            data-slot="dealt-card"
            data-state={swapping ? "swapping" : "dealt"}
            className={cn(
              "grid grid-cols-[90px_minmax(0,1fr)] gap-3.5 bg-card p-3 motion-safe:transition-transform sm:grid-cols-[120px_minmax(0,1fr)]",
              swapping && "ring-2 ring-highlight",
            )}
          >
            <AwardCover award="game_of_the_year" game={game} fallbackClassName="text-base" />
            <div className="min-w-0">
              <h3 className="font-headline text-[1.6rem] leading-[0.95] break-words">{game.title}</h3>
              {swapping && <p className="mt-1.5 text-[0.82rem] text-highlight">Pick the game to put in its place below.</p>}
              {open && (
                <div className="-ml-2 mt-2 flex flex-wrap gap-0.5">
                  <Button type="button" variant="ghost" size="sm" disabled={state.pending} onClick={() => (swapping ? state.cancel() : state.startReplacing(n))}>
                    <ArrowLeftRight data-icon="inline-start" />
                    {swapping ? "Keep it" : "Swap"}
                  </Button>
                  <Button type="button" variant="destructive-ghost" size="sm" disabled={state.pending} onClick={() => state.withdraw(n)}>
                    {state.withdrawing === n.id ? <Loader2 className="motion-safe:animate-spin" /> : <Trash2 data-icon="inline-start" />}
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
