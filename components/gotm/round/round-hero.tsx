import type { GotmRoundCategory, GotmRoundDetail, VotingCategory } from "@/lib/api/types";
import type { DiscordLinkConfig } from "@/lib/gotm-links";
import { categoryRows, rowVotes, runoffSummary, votesLabel, winnerLinks } from "@/lib/gotm-round";
import { splitMonthYear } from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";
import { RoundHeroPanel } from "./round-hero-panel";

// The round's winners as a hinged diptych: GOTM's art left, NR-GOTM's right,
// the round numeral between them. When only one Category has winners, the
// numeral moves to the left edge and that Category spans the rest, one panel
// per winner side by side. On phones the hinge drops (the page title carries
// the number) and the halves sit side by side, or a spanning Category's
// winners stack. Each winner carries its Reddit and Discord thread links,
// the first its Category's voting results too.
export function RoundHero({ round, discord }: { round: GotmRoundDetail; discord: DiscordLinkConfig }) {
  const won = (["gotm", "nr_gotm"] as const).filter((k) => categoryRows(round[k]).some((r) => r.won));
  if (won.length === 0) return null;
  const hinge = <RoundHinge round={round} className={won.length === 1 ? "md:mr-3.5" : undefined} />;

  if (won.length === 1) {
    const [kind] = won;
    return (
      <div className="grid min-h-64 grid-cols-1 md:min-h-74 md:grid-cols-[8.25rem_minmax(0,1fr)]">
        {hinge}
        <RoundWinners kind={kind} category={round[kind]} discord={discord} across />
      </div>
    );
  }
  return (
    <div className="grid min-h-64 grid-cols-2 gap-1.5 md:min-h-74 md:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)] md:gap-0">
      <RoundWinners kind="gotm" category={round.gotm} discord={discord} />
      {hinge}
      <RoundWinners kind="nr_gotm" category={round.nr_gotm} discord={discord} />
    </div>
  );
}

function RoundHinge({ round, className }: { round: GotmRoundDetail; className?: string }) {
  const { month, year } = splitMonthYear(round.month_year);
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex flex-col items-center justify-center border-y border-border before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-border max-md:hidden",
        className,
      )}
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
  );
}

// A Category's winners: stacked in their half of a diptych, or, spanning the
// row (`across`), side by side with full-size titles, stacked on a phone.
function RoundWinners({
  kind,
  category,
  discord,
  across = false,
}: {
  kind: VotingCategory;
  category: GotmRoundCategory;
  discord: DiscordLinkConfig;
  across?: boolean;
}) {
  const winners = categoryRows(category).filter((r) => r.won);
  const runoff = runoffSummary(category);
  return (
    <div
      className={cn(
        "min-w-0 gap-1.5",
        across ? "grid md:auto-cols-fr md:grid-flow-col" : "flex flex-col",
      )}
    >
      {winners.map((row, i) => {
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
            links={winnerLinks(category, row, i === 0, discord)}
            compact={across ? winners.length > 2 : winners.length > 1}
            mirrored={!across && kind === "nr_gotm"}
          />
        );
      })}
    </div>
  );
}
