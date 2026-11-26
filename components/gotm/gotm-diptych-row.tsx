import Link from "next/link";
import { gotmRoundHref, type GotmHistoryFilters as Filters } from "@/lib/api/gotm-rounds";
import type { GotmRound } from "@/lib/api/types";
import { roundMonthYear, sortedWinners, splitMonthYear } from "@/components/issue/gotm-shared";
import { GotmDiptychHalf } from "./gotm-diptych-half";
import { cn } from "@/lib/utils";

// One round in the GOTM History. The Anton round numeral sits on an ink tab
// over the top-left corner of the round's banners, like a magazine page
// number, with the month and "N nominated" tag beside it above the art. A
// round both Categories won splits into GOTM's half and NR-GOTM's, a thin
// rule between them, co-winners on a "+" line. A round one Category won, or
// the history narrowed to one Category, gives each winner its own banner
// across the width. On a phone the banners stack. The whole row opens the
// Round Page, carrying the page's filters so its way back returns here. A
// round still being decided (a tie or a tally not yet in) has no Round Page
// yet: its row is not a link and carries a "Deciding" tag.
export function GotmDiptychRow({
  round,
  filters,
  lead = false,
}: {
  round: GotmRound;
  filters: Filters;
  lead?: boolean;
}) {
  const kind = filters.kind;
  const kinds = kind === "both" ? (["gotm", "nr_gotm"] as const) : ([kind] as const);
  const nominated = kinds.reduce((n, k) => n + (round[k]?.nominations_count ?? 0), 0);
  const { month, year } = splitMonthYear(roundMonthYear(round));
  const when = [month, year].filter(Boolean).join(" ");
  const winnersOf = (k: (typeof kinds)[number]) => sortedWinners(round[k]?.games ?? []);
  const won = kinds.filter((k) => winnersOf(k).length > 0);
  // Both Categories asked for and not exactly one won: a half each.
  const halves = kinds.length === 2 && won.length !== 1;
  const across = won[0] ?? kinds[0];
  // Older API responses carry no `closed`; those rounds were all closed.
  const closed = round.closed !== false;
  const tag = "font-label rounded-xs border px-1.5 py-0.5 text-[0.65625rem] font-semibold tracking-[0.12em] uppercase sm:px-1.75 sm:py-0.75 sm:text-[0.6875rem]";

  const body = (
    <>
      <div className="mb-1.5 flex h-6.5 items-center gap-2.5 sm:mb-2 sm:h-7.5 sm:gap-3.5">
        <span className="font-headline relative z-20 self-start rounded-br-sm bg-background pr-3 pb-1 text-[3.75rem] leading-none sm:pr-4 sm:pb-1.5 sm:text-[5.75rem]">
          <span className="sr-only">Round </span>
          {round.round_number}
        </span>
        {when && (
          <span className="font-label text-[0.71875rem] font-bold tracking-[0.18em] text-dim-foreground uppercase sm:text-[0.75rem]">
            <span className="sr-only">, </span>
            {when}
          </span>
        )}
        {!closed && (
          <span className={cn(tag, "border-border-strong text-dim-foreground")}>
            <span className="sr-only">, </span>
            Deciding
          </span>
        )}
        {nominated > 0 && (
          <span className={cn(tag, "border-highlight text-highlight")}>
            <span className="sr-only">, </span>
            {nominated} nominated
          </span>
        )}
      </div>
      <div
        className={cn(
          "grid gap-1.5",
          lead ? "auto-rows-[10.75rem] sm:h-62" : "auto-rows-[9.625rem] sm:h-54",
          halves
            ? "relative sm:auto-rows-auto sm:grid-cols-2 sm:gap-x-3.75 sm:before:absolute sm:before:inset-y-0 sm:before:left-1/2 sm:before:w-px sm:before:bg-border-strong"
            : "sm:auto-cols-fr sm:auto-rows-auto sm:grid-flow-col",
        )}
      >
        {halves
          ? kinds.map((k, i) => (
              <GotmDiptychHalf
                key={k}
                kind={k}
                winners={winnersOf(k)}
                lead={lead}
                mirrored={i === 1}
              />
            ))
          : (winnersOf(across).length ? winnersOf(across).map((w) => [w]) : [[]]).map((winners, i) => (
              <GotmDiptychHalf
                key={winners[0]?.game_index ?? i}
                kind={across}
                winners={winners}
                lead={lead}
              />
            ))}
      </div>
    </>
  );

  const rowClass = cn(
    "relative block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight",
    // Only a link answers a hover.
    closed && "group/row",
  );
  return (
    <li>
      {closed ? (
        <Link href={gotmRoundHref(round.round_number, filters)} className={rowClass}>
          {body}
        </Link>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}
