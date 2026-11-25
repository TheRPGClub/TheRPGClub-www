import Link from "next/link";
import { gotmRoundHref, type GotmHistoryFilters as Filters } from "@/lib/api/gotm-rounds";
import type { GotmRound } from "@/lib/api/types";
import { roundMonthYear, sortedWinners, splitMonthYear } from "@/components/issue/gotm-shared";
import { GotmDiptychHalf } from "./gotm-diptych-half";
import { cn } from "@/lib/utils";

// One round in the GOTM History as a hinged diptych: GOTM's leaf left,
// NR-GOTM's right, joined by the round numeral. Narrowed to one Category the
// hinge moves left and the leaf takes the width. On a phone the hinge turns
// into a band above the leaves. The whole row opens the Round Page, carrying
// the page's filters so its way back returns here. A round still being
// decided (a tie or a tally not yet in) has no Round Page yet: its row is
// not a link and carries a "Deciding" tag.
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
  const both = kinds.length === 2;
  // Older API responses carry no `closed`; those rounds were all closed.
  const closed = round.closed !== false;

  const rowClass = cn(
    "grid gap-x-1.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight sm:gap-x-0",
    // Only a link answers a hover.
    closed && "group/row",
    both
      ? "grid-cols-2 sm:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)]"
      : "grid-cols-1 sm:grid-cols-[8.25rem_minmax(0,1fr)]",
    lead ? "grid-rows-[auto_14.5rem] sm:h-67" : "grid-rows-[auto_12.5rem] sm:h-57",
    !both && !lead && "sm:h-52.5",
    "sm:grid-rows-1",
  );
  const leaves = (
    <>
      <div
        className={cn(
          "col-span-full mb-2 flex items-center gap-2.5",
          "sm:relative sm:col-span-1 sm:mb-0 sm:flex-col sm:justify-center sm:gap-0 sm:border-y sm:border-border",
          "sm:before:absolute sm:before:inset-y-0 sm:before:left-1/2 sm:before:w-px sm:before:bg-border",
          both ? "sm:col-start-2 sm:row-start-1" : "sm:mr-3.5",
        )}
      >
        <span className="font-headline relative bg-background text-[2.75rem] leading-[0.9] sm:py-1 sm:text-[5.75rem] sm:leading-none">
          <span className="sr-only">Round </span>
          {round.round_number}
        </span>
        {when && (
          <span className="font-label relative bg-background text-[0.75rem] font-bold tracking-[0.18em] text-dim-foreground uppercase sm:px-1.5 sm:py-0.5">
            <span className="sr-only">, </span>
            {when}
          </span>
        )}
        <span aria-hidden className="h-px flex-1 bg-border sm:hidden" />
        {!closed && (
          <span className="font-label relative rounded-xs border border-border-strong bg-background px-1.75 py-0.75 text-[0.6875rem] font-semibold tracking-[0.12em] text-dim-foreground uppercase sm:mt-2.5">
            <span className="sr-only">, </span>
            Deciding
          </span>
        )}
        {nominated > 0 && (
          <span className="font-label relative rounded-xs border border-highlight bg-background px-1.75 py-0.75 text-[0.6875rem] font-semibold tracking-[0.12em] text-highlight uppercase sm:mt-2.5">
            <span className="sr-only">, </span>
            {nominated} nominated
          </span>
        )}
      </div>
      {kinds.map((k, i) => (
        <div
          key={k}
          className={cn(both && i === 0 && "sm:col-start-1 sm:row-start-1", both && i === 1 && "sm:col-start-3")}
        >
          <GotmDiptychHalf
            kind={k}
            winners={sortedWinners(round[k]?.games ?? [])}
            nominationsCount={round[k]?.nominations_count ?? 0}
            lead={lead}
            mirrored={both && i === 1}
          />
        </div>
      ))}
    </>
  );

  return (
    <li>
      {closed ? (
        <Link href={gotmRoundHref(round.round_number, filters)} className={rowClass}>
          {leaves}
        </Link>
      ) : (
        <div className={rowClass}>{leaves}</div>
      )}
    </li>
  );
}
