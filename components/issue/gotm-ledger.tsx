import Link from "next/link";
import type {
  GotmRound,
  GotmRoundBlock,
  GotmRoundGame,
  VotingCategory,
} from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import {
  OutboundLinks,
  TRACK_LABEL,
  UNKNOWN_GAME_TITLE,
  groupByYear,
  roundMonthYear,
  sortedWinners,
  splitMonthYear,
} from "@/components/issue/gotm-shared";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// The GOTM history with both tracks: a ledger of rounds, each a monumental
// round number beside its GOTM art panels and its NR-GOTM art panels.
// Co-winners split their track's column. Server-only (the Discord link
// config reads server env vars).

const ABSENT: Record<VotingCategory, string> = {
  gotm: "No GOTM this round",
  nr_gotm: "No non-RPG pick this round",
};

export function GotmLedger({
  rounds,
  searching,
}: {
  rounds: GotmRound[];
  // A title search drops the other track's non-matching block, so its
  // absence means "no match", not "no winner".
  searching: boolean;
}) {
  return (
    <div className="space-y-2">
      {groupByYear(rounds).map((group, gi) => (
        <section
          key={`${group.year ?? "undated"}-${gi}`}
          aria-label={group.year ? String(group.year) : "Undated rounds"}
        >
          {group.year && (
            <h2 className="font-headline border-b-2 border-paper pt-2 pb-1.5 text-[1.4rem] text-paper-mute">
              {group.year}
            </h2>
          )}
          <ol>
            {group.rounds.map((round) => (
              <LedgerRow
                key={round.round_number}
                round={round}
                searching={searching}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function LedgerRow({
  round,
  searching,
}: {
  round: GotmRound;
  searching: boolean;
}) {
  const { month, year } = splitMonthYear(roundMonthYear(round));

  return (
    <li className="grid gap-2.5 border-b border-rule py-5 md:grid-cols-[6.5rem_minmax(0,1fr)] md:gap-4.5 xl:grid-cols-[8.5rem_minmax(0,1.6fr)_minmax(0,1fr)]">
      <h3 className="flex items-baseline gap-3 md:block">
        <span className="font-headline block text-[3.5rem] leading-[0.8] md:text-[4rem] xl:text-[5.25rem]">
          {round.round_number}
        </span>
        <span className="font-label block text-[0.85rem] leading-[1.2] font-extrabold tracking-[0.08em] text-paper-mute md:mt-2.5">
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
          "font-label grid min-h-24 place-items-center rounded-sm border border-dashed border-rule-strong p-3.5 text-center text-[0.85rem] font-bold tracking-[0.06em] text-paper-mute md:min-h-49",
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
          <ArtPanel
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

function ArtPanel({
  kind,
  entry,
  single,
  votingResultsMessageId,
}: {
  kind: VotingCategory;
  entry: GotmRoundGame;
  single: boolean;
  votingResultsMessageId: string | null;
}) {
  const game = entry.game;
  const title = game?.title ?? UNKNOWN_GAME_TITLE;
  const art = game?.art_url ?? game?.cover_url;
  const href = entry.gamedb_game_id ? `/games/${entry.gamedb_game_id}` : null;
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
    votingResultsMessageId,
  });
  // Co-winner panels are narrow; the results link stays on the lone winner.
  const shownLinks = single ? links : links.slice(0, 2);

  return (
    <article
      className={cn(
        "group/panel relative isolate flex min-h-38 w-full overflow-hidden rounded-sm bg-ink-3 after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 md:min-h-49",
        kind === "gotm" ? "after:bg-gotm" : "after:bg-nr",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/panel:scale-[1.03]"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(11_11_13/0.96)_0%,rgb(11_11_13/0.6)_42%,rgb(11_11_13/0.05)_75%)]"
      />
      {single && (
        <WinnerMark track={kind} className="absolute top-3 right-3 size-14" />
      )}
      {/* The whole panel opens the game; the link row sits above it. */}
      {href && (
        <Link
          href={href}
          aria-label={`View ${title}`}
          className="absolute inset-0 z-10 focus-visible:ring-2 focus-visible:ring-paper focus-visible:outline-none focus-visible:ring-inset"
        />
      )}
      <div className="mt-auto w-full px-4 pt-10 pb-3.5">
        <p
          className={cn(
            "font-label inline-block rounded-xs px-1.75 py-px text-[0.75rem] font-extrabold tracking-[0.1em] text-white",
            kind === "gotm" ? "bg-gotm" : "bg-nr",
          )}
        >
          {TRACK_LABEL[kind]}
        </p>
        <h4
          className={cn(
            "font-headline mt-2 leading-[0.92] text-balance",
            single ? "text-[1.75rem] md:text-[2rem]" : "text-[1.45rem]",
          )}
        >
          {title}
        </h4>
        <OutboundLinks links={shownLinks} className="mt-2" />
      </div>
    </article>
  );
}
