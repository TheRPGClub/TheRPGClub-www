import Link from "next/link";
import type { GotyNomination, GotyVote } from "@/lib/api/goty";
import { gotyStatusLine, tiedAwards } from "@/lib/goty-desk";
import { STAFF_DESK_BACK } from "@/lib/staff";
import { BackLink } from "@/components/shell/back-link";
import { cn } from "@/lib/utils";
import { GotyDatesOp } from "./goty-dates-op";
import { GotyNominationDesk } from "./goty-nomination-desk";
import { GotyTieBreak } from "./goty-tie-break";
import { GotyWinnersOp } from "./goty-winners-op";

// The GOTY Vote desk (www#194), laid out like the voting console: the
// year as the numeral with its status line, then the Game of the Year
// nominations beside the operations (dates, and a tie break per Award a
// runoff left tied, and the winners once decided).
export function GotyDesk({
  vote,
  years,
  nominations,
  viewerId,
  viewerName,
  now,
}: {
  vote: GotyVote;
  years: number[];
  nominations: GotyNomination[];
  viewerId: string;
  viewerName: string;
  now: number;
}) {
  const ties = tiedAwards(vote);
  // Keyed by year: moving between years on the year links is a soft
  // navigation, and without the key the dates draft, the removed and held
  // nominations and the tie pick would carry over to the other year.
  return (
    <div key={vote.year} className="flex flex-col">
      <BackLink {...STAFF_DESK_BACK} />
      <header className="grid items-end gap-x-7 gap-y-1.5 border-b-2 border-foreground pb-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <p aria-hidden className="font-headline text-[5.5rem] leading-[0.8] md:text-[8rem]">
          {vote.year}
        </p>
        <div className="min-w-0">
          <h1 className="font-headline text-[2.6rem] leading-[0.9] md:text-[3.75rem]">GOTY Vote</h1>
          <p className="font-label mt-1.5 text-base tracking-[0.08em] text-dim-foreground">
            {gotyStatusLine(vote, nominations.length, now)}
          </p>
          {years.length > 1 && (
            <nav aria-label="GOTY Vote years" className="font-label mt-1 flex flex-wrap gap-x-3 text-[0.85rem] tracking-[0.08em]">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/admin/goty?year=${y}`}
                  aria-current={y === vote.year ? "page" : undefined}
                  className={cn(
                    "underline-offset-4 hover:text-highlight",
                    y === vote.year ? "font-bold text-foreground" : "text-faint-foreground",
                  )}
                >
                  {y}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      <div className="mt-5.5 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <GotyNominationDesk
          vote={vote}
          nominations={nominations}
          viewerId={viewerId}
          viewerName={viewerName}
          now={now}
        />
        <aside aria-label="GOTY Vote operations" className={cn("grid gap-2.5", ties.length > 0 && "max-lg:order-first")}>
          {ties.map((award) => (
            <GotyTieBreak key={award.award} year={vote.year} award={award} />
          ))}
          {vote.phase === "decided" && <GotyWinnersOp vote={vote} />}
          <GotyDatesOp vote={vote} now={now} />
        </aside>
      </div>
    </div>
  );
}
