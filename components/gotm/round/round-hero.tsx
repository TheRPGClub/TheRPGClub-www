import type { GotmRoundCategory, GotmRoundDetail, VotingCategory } from "@/lib/api/types";
import type { DiscordLinkConfig } from "@/lib/gotm-links";
import { categoryRows, rowVotes, runoffSummary, votesLabel, winnerLinks } from "@/lib/gotm-round";
import { cn } from "@/lib/utils";
import { RoundHeroPanel } from "./round-hero-panel";

// The round's winners across the page under its "Round N · Month Year"
// heading. A round both Categories won splits into GOTM's half and
// NR-GOTM's, a thin rule between them, co-winners stacked in their half; a
// round one Category won gives each winner its own panel across the width.
// On a phone every panel stacks. Each winner carries its Reddit and Discord
// thread links, the first its Category's voting results too.
export function RoundHero({ round, discord }: { round: GotmRoundDetail; discord: DiscordLinkConfig }) {
  const won = (["gotm", "nr_gotm"] as const).filter((k) => categoryRows(round[k]).some((r) => r.won));
  if (won.length === 0) return null;

  if (won.length === 1) {
    const [kind] = won;
    return <RoundWinners kind={kind} category={round[kind]} discord={discord} across />;
  }
  return (
    <div className="relative grid gap-1.5 md:grid-cols-2 md:gap-x-3.75 md:before:absolute md:before:inset-y-0 md:before:left-1/2 md:before:w-px md:before:bg-border-strong">
      <RoundWinners kind="gotm" category={round.gotm} discord={discord} />
      <RoundWinners kind="nr_gotm" category={round.nr_gotm} discord={discord} />
    </div>
  );
}

// A Category's winners: stacked in their half of a mixed round, or, across
// the page (`across`), side by side with full-size titles, stacked on a phone.
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
