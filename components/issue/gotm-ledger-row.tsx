import type { GotmRound, GotmRoundBlock, VotingCategory } from "@/lib/api/types";
import { GotmLedgerPanel } from "@/components/issue/gotm-ledger-panel";
import {
  TRACK_LABEL,
  roundMonthYear,
  sortedWinners,
  splitMonthYear,
} from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";

// One round in the GOTM ledger: the monumental round number beside its
// GOTM art panels and its NR-GOTM art panels.

const ABSENT: Record<VotingCategory, string> = {
  gotm: "No GOTM this round",
  nr_gotm: "No non-RPG pick this round",
};

export function LedgerRow({
  round,
  searching,
}: {
  round: GotmRound;
  searching: boolean;
}) {
  const { month, year } = splitMonthYear(roundMonthYear(round));

  return (
    <li className="grid gap-2.5 border-b border-border py-5 md:grid-cols-[6.5rem_minmax(0,1fr)] md:gap-4.5 xl:grid-cols-[8.5rem_minmax(0,1.6fr)_minmax(0,1fr)]">
      <h3 className="flex items-baseline gap-3 md:block">
        <span className="font-headline block text-[3.5rem] leading-[0.8] md:text-[4rem] xl:text-[5.25rem]">
          {round.round_number}
        </span>
        <span className="font-label block text-[0.85rem] leading-[1.2] font-extrabold tracking-[0.08em] text-faint-foreground md:mt-2.5">
          <span className="sr-only">Round {round.round_number}, </span>
          {month}
          {year && <span className="md:block"> {year}</span>}
        </span>
      </h3>
      <TrackColumn
        kind="gotm"
        block={round.gotm}
        roundNumber={round.round_number}
        searching={searching}
      />
      <TrackColumn
        kind="nr_gotm"
        block={round.nr_gotm}
        roundNumber={round.round_number}
        searching={searching}
        className="md:col-start-2 xl:col-start-auto"
      />
    </li>
  );
}

function TrackColumn({
  kind,
  block,
  roundNumber,
  searching,
  className,
}: {
  kind: VotingCategory;
  block: GotmRoundBlock | null;
  roundNumber: number;
  searching: boolean;
  className?: string;
}) {
  const winners = block ? sortedWinners(block.games) : [];

  if (winners.length === 0) {
    // No block at all under a search is a non-match; say nothing.
    if (!block && searching) return <div aria-hidden className={className} />;
    return (
      <p
        className={cn(
          "font-label grid min-h-24 place-items-center rounded-sm border border-dashed border-border-strong p-3.5 text-center text-[0.85rem] font-bold tracking-[0.06em] text-faint-foreground md:min-h-49",
          className,
        )}
      >
        {ABSENT[kind]}
      </p>
    );
  }

  return (
    <ul
      aria-label={`${TRACK_LABEL[kind]}, round ${roundNumber}`}
      className={cn(
        "grid gap-1.5",
        winners.length === 2 && "sm:grid-cols-2",
        winners.length >= 3 && "sm:grid-cols-3",
        className,
      )}
    >
      {winners.map((entry, i) => (
        <li key={entry.gamedb_game_id ?? `index-${i}`} className="flex">
          <GotmLedgerPanel
            kind={kind}
            entry={entry}
            single={winners.length === 1}
            votingResultsMessageId={block!.voting_results_message_id}
          />
        </li>
      ))}
    </ul>
  );
}
