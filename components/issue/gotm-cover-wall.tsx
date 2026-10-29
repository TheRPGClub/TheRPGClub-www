import Link from "next/link";
import type { GotmRound, GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import {
  OutboundLinks,
  UNKNOWN_GAME_TITLE,
  groupByYear,
  sortedWinners,
  splitTitle,
} from "@/components/issue/gotm-shared";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// The GOTM history narrowed to one track: every round gets its own cover,
// the round number monumental in the track's ink over the winner's key art.
// Co-winners are listed under the lead headline. Server-only (the Discord
// link config reads server env vars).

const TRACK = {
  gotm: {
    label: "Game of the Month",
    number: "text-gotm",
    accent: "text-highlight",
    co: "text-gotm-soft",
  },
  nr_gotm: {
    label: "Non-RPG Game of the Month",
    number: "text-nr",
    accent: "text-nr-soft",
    co: "text-nr-soft",
  },
} as const;

export function GotmCoverWall({
  kind,
  rounds,
}: {
  kind: VotingCategory;
  rounds: GotmRound[];
}) {
  return (
    <div className="space-y-8">
      {groupByYear(rounds).map((group, gi) => (
        <section
          key={`${group.year ?? "undated"}-${gi}`}
          aria-labelledby={`year-${group.year ?? "undated"}-${gi}`}
          className="space-y-5"
        >
          <h2
            id={`year-${group.year ?? "undated"}-${gi}`}
            className="font-headline flex flex-wrap items-baseline gap-x-3 border-b-2 border-paper pb-2 text-[2.5rem] leading-none"
          >
            {group.year ?? "Undated"}
            <span className="font-label text-sm font-bold tracking-[0.08em] text-paper-mute">
              {group.rounds.length}{" "}
              {group.rounds.length === 1 ? "round" : "rounds"} on this page
            </span>
          </h2>
          <ol className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {group.rounds.map((round) => {
              const block = round[kind];
              if (!block) return null;
              return (
                <li key={round.round_number} className="flex">
                  <RoundCover
                    kind={kind}
                    roundNumber={round.round_number}
                    monthYear={block.month_year}
                    winners={sortedWinners(block.games)}
                    votingResultsMessageId={block.voting_results_message_id}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function RoundCover({
  kind,
  roundNumber,
  monthYear,
  winners,
  votingResultsMessageId,
}: {
  kind: VotingCategory;
  roundNumber: number;
  monthYear: string;
  winners: GotmRoundGame[];
  votingResultsMessageId: string | null;
}) {
  const track = TRACK[kind];
  const [lead, ...coWinners] = winners;
  const game = lead?.game;
  const title = lead ? (game?.title ?? UNKNOWN_GAME_TITLE) : null;
  const art = game?.art_url ?? game?.cover_url;
  const href = lead?.gamedb_game_id ? `/games/${lead.gamedb_game_id}` : null;
  const [first, second] = title ? splitTitle(title) : ["", ""];
  const links = lead
    ? gotmLinks({
        redditUrl: lead.reddit_url,
        threadId: lead.thread_id,
        votingResultsMessageId,
      })
    : [];

  return (
    <article
      aria-label={`Round ${roundNumber}, ${monthYear}`}
      className={cn(
        "group/cover relative isolate flex aspect-[4/5] w-full flex-col overflow-hidden rounded-sm bg-ink-3 sm:aspect-[3/4]",
        "after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1",
        kind === "gotm" ? "after:bg-gotm" : "after:bg-nr",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/cover:scale-[1.03]"
        />
      )}
      {/* Ink at the masthead and the foot, the art clear between. */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(11_11_13/0.9)_0%,rgb(11_11_13/0.55)_16%,rgb(11_11_13/0.05)_32%,rgb(11_11_13/0.1)_50%,rgb(11_11_13/0.97)_84%)]"
      />
      {href && (
        <Link
          href={href}
          aria-label={`View ${title}`}
          className="absolute inset-0 z-10 focus-visible:ring-2 focus-visible:ring-paper focus-visible:outline-none focus-visible:ring-inset"
        />
      )}

      <div className="flex items-end gap-2.5 px-4.5 pt-4">
        <p
          className={cn(
            "font-headline text-[4rem] leading-[0.8]",
            track.number,
          )}
        >
          {roundNumber}
        </p>
        <p className="font-label text-[0.82rem] leading-[1.15] font-extrabold tracking-[0.08em] [text-shadow:0_1px_6px_rgb(0_0_0/0.8)]">
          Round {roundNumber}
          <span className="block text-paper-mute">{monthYear}</span>
        </p>
      </div>

      {lead && (
        <WinnerMark
          track={kind}
          className="absolute top-24 right-3.5 size-16"
        />
      )}

      <div className="mt-auto px-4.5 pb-4">
        {title ? (
          <h3 className="font-headline text-[2.25rem] leading-[0.9] text-balance">
            <span className="sr-only">{track.label}: </span>
            {first && <span className="block">{first}</span>}
            <span className={cn("block", track.accent)}>{second}</span>
          </h3>
        ) : (
          <p className="font-label text-sm font-bold tracking-[0.06em] text-paper-mute">
            No {kind === "gotm" ? "GOTM" : "non-RPG pick"} this round
          </p>
        )}

        {coWinners.length > 0 && (
          <ul className="relative z-20 mt-2 space-y-1">
            <li
              className={cn(
                "font-label text-[0.78rem] font-extrabold tracking-[0.08em]",
                track.co,
              )}
            >
              {winners.length} winners
            </li>
            {coWinners.map((entry, i) => (
              <CoWinner
                key={entry.gamedb_game_id ?? `index-${i}`}
                entry={entry}
              />
            ))}
          </ul>
        )}

        <OutboundLinks links={links} className="mt-2.5" />
      </div>
    </article>
  );
}

// A co-winner under the lead headline: its name to the game page, its own
// Reddit post and thread beside it.
function CoWinner({ entry }: { entry: GotmRoundGame }) {
  const title = entry.game?.title ?? UNKNOWN_GAME_TITLE;
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
  });
  return (
    <li className="flex flex-wrap items-center gap-x-2 border-t border-paper/15 pt-1">
      <span className="font-label text-[0.92rem] font-extrabold tracking-[0.03em]">
        +{" "}
        {entry.gamedb_game_id ? (
          <Link
            href={`/games/${entry.gamedb_game_id}`}
            className="underline decoration-paper/30 underline-offset-3 transition-colors hover:text-highlight"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </span>
      <OutboundLinks links={links} />
    </li>
  );
}
