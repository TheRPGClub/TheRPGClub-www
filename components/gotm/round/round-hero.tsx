import type { GotmRoundCategory, GotmRoundDetail, VotingCategory } from "@/lib/api/types";
import { categoryRows, nomineeCount, rowVotes, runoffSummary, votesLabel } from "@/lib/gotm-round";
import { TRACK_LABEL, splitMonthYear } from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";
import { RoundHeroPanel } from "./round-hero-panel";

// The round's winners as a hinged diptych: GOTM's art left, NR-GOTM's right,
// the round numeral between them. On phones the hinge drops (the page title
// carries the number) and the halves sit side by side.
export function RoundHero({ round }: { round: GotmRoundDetail }) {
  const { month, year } = splitMonthYear(round.month_year);
  return (
    <div className="grid min-h-64 grid-cols-2 gap-1.5 md:min-h-74 md:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)] md:gap-0">
      <RoundHalf kind="gotm" category={round.gotm} />
      <div
        aria-hidden
        className="relative flex flex-col items-center justify-center border-y border-border before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-border max-md:hidden"
      >
        <span className="font-headline relative bg-background py-1 text-[5.75rem] leading-none">
          {round.round_number}
        </span>
        {month && (
          <span className="font-label relative bg-background px-1.5 py-0.5 text-[0.75rem] font-bold tracking-[0.18em] text-dim-foreground uppercase">
            {month} {year}
          </span>
        )}
      </div>
      <RoundHalf kind="nr_gotm" category={round.nr_gotm} />
    </div>
  );
}

function RoundHalf({ kind, category }: { kind: VotingCategory; category: GotmRoundCategory }) {
  const winners = categoryRows(category).filter((r) => r.won);
  if (winners.length === 0) return <NoWinnerPanel kind={kind} nominated={nomineeCount(category)} />;
  const runoff = runoffSummary(category);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {winners.map((row) => {
        const votes = rowVotes(category, row);
        const meta = [
          votes != null && votesLabel(votes),
          runoff && row.nomination?.runoff_votes != null && `won runoff ${runoff.score}`,
        ].filter(Boolean);
        return (
          <RoundHeroPanel
            key={row.key}
            kind={kind}
            row={row}
            meta={meta.length ? meta.join(" · ") : null}
            compact={winners.length > 1}
          />
        );
      })}
    </div>
  );
}

// A Category nobody won (NR-GOTM in rounds 125, 127 and 137): a hatched
// blank with a dashed foot bar instead of art.
function NoWinnerPanel({ kind, nominated }: { kind: VotingCategory; nominated: number }) {
  const nr = kind === "nr_gotm";
  return (
    <div
      className={cn(
        "relative flex min-h-56 flex-col justify-end overflow-hidden rounded-sm border border-border bg-[repeating-linear-gradient(135deg,var(--color-card)_0_12px,var(--color-muted)_12px_24px)] px-3 pb-4 md:px-5 md:pb-5",
        nr && "text-right",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.75 bg-[repeating-linear-gradient(90deg,var(--stripe)_0_14px,transparent_14px_24px)]",
          nr ? "[--stripe:var(--color-nr)]" : "[--stripe:var(--color-gotm)]",
        )}
      />
      <p className="font-headline text-[1.25rem] leading-[1.02] text-dim-foreground uppercase text-balance md:text-[2rem]">
        {`No ${TRACK_LABEL[kind]} winner this round`}
      </p>
      {nominated > 0 && (
        <p className="font-label mt-1.5 text-[0.8rem] font-semibold tracking-[0.1em] text-faint-foreground uppercase">
          {nominated} nominated
        </p>
      )}
    </div>
  );
}
