import type { ReactNode } from "react";
import type { GotmRoundCategory, VotingCategory } from "@/lib/api/types";
import { categoryRows, nomineeCount, rowVotes, runoffSummary, voteTotals, votesLabel } from "@/lib/gotm-round";
import { gotmLinks, NO_DISCORD_LINKS, type DiscordLinkConfig } from "@/lib/gotm-links";
import { OutboundLinks, TRACK_LABEL } from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";
import { RoundNominee } from "./round-nominee";

// One Category's column under the diptych: its head (nominee count, votes
// cast or "In nomination order"), a runoff or no-winner line, then every
// game, winners first. A Category nobody won has no hero panel, so its
// no-winner line carries the voting-results link.
export function RoundColumn({
  kind,
  category,
  discord = NO_DISCORD_LINKS,
}: {
  kind: VotingCategory;
  category: GotmRoundCategory;
  discord?: DiscordLinkConfig;
}) {
  const rows = categoryRows(category);
  const nominees = nomineeCount(category);
  const { total, max } = voteTotals(category);
  const runoff = runoffSummary(category);
  const nr = kind === "nr_gotm";

  return (
    <section aria-labelledby={`round-${kind}`} className="min-w-0">
      <header className="mb-1 flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-2">
        <h2
          id={`round-${kind}`}
          className={cn("font-headline text-[1.125rem] md:text-[1.25rem]", nr ? "text-nr-soft" : "text-gotm-soft")}
        >
          {TRACK_LABEL[kind]} · {nominees} {nominees === 1 ? "nominee" : "nominees"}
        </h2>
        <p className="font-label text-[0.8rem] font-semibold tracking-[0.1em] text-faint-foreground uppercase">
          {category.voted ? `${votesLabel(total)} cast` : nominees > 1 ? "In nomination order" : null}
        </p>
      </header>
      {rows.every((r) => !r.won) && (
        <ColumnLine
          kind={kind}
          label={`No ${TRACK_LABEL[kind]} winner this round`}
          detail={
            <OutboundLinks
              links={gotmLinks({ votingResultsMessageId: category.voting_results_message_id }, discord)}
            />
          }
        />
      )}
      {runoff && (
        <ColumnLine
          kind={kind}
          label={`${runoff.won ? "Won in a runoff" : "Runoff"} · ${runoff.score}`}
          detail={runoff.tie}
        />
      )}
      <ol>
        {rows.map((row) => (
          <RoundNominee key={row.key} kind={kind} row={row} votes={rowVotes(category, row)} max={max} />
        ))}
      </ol>
    </section>
  );
}

function ColumnLine({ kind, label, detail }: { kind: VotingCategory; label: string; detail?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-b border-border py-2.5 text-[0.875rem] text-dim-foreground">
      <span
        className={cn(
          "font-label rounded-xs border px-2 py-0.5 text-[0.75rem] font-semibold tracking-[0.12em] whitespace-nowrap text-foreground uppercase",
          kind === "nr_gotm" ? "border-nr" : "border-gotm",
        )}
      >
        {label}
      </span>
      {detail}
    </div>
  );
}
