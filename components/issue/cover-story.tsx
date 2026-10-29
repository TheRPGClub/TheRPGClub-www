import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { gotmCardProps } from "@/components/gotm-card";
import { PlatformPills } from "@/components/platform-pills";
import { Starburst } from "@/components/issue/starburst";
import { buttonVariants } from "@/components/ui/button";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// The issue's cover story: a round's winners for one track, full-bleed key art
// under a monumental round number. GOTM is normally the cover; NR-GOTM takes
// it only when a round has no GOTM. Co-winners share the one cover: two split
// it, three put a lead panel beside two stacked ones. Server-only (the
// Discord link config reads server env vars).

const TRACK = {
  gotm: {
    label: "Game of the Month",
    number: "text-gotm",
    accent: "text-highlight",
    button: "default",
  },
  nr_gotm: {
    label: "Non-RPG Game of the Month",
    number: "text-nr",
    accent: "text-nr-soft",
    button: "nr",
  },
} as const;

const UNKNOWN_GAME_TITLE = "Unknown game";

// Panel scale by winner count: the lead's size, then each co-winner's.
type PanelSize = "xl" | "l" | "m" | "s";
const SIZES: Record<number, PanelSize[]> = {
  1: ["xl"],
  2: ["l", "m"],
  3: ["l", "s", "s"],
};

const TITLE_SIZE: Record<PanelSize, string> = {
  xl: "text-6xl sm:text-7xl lg:text-[5.75rem]",
  l: "text-5xl lg:text-6xl",
  m: "text-4xl lg:text-[2.875rem]",
  s: "text-3xl lg:text-[2.125rem]",
};

// Headlines break at the subtitle colon ("Metaphor:" / "ReFantazio") and the
// second line takes the track's accent; a title without one accents its last
// word, and a one-word title accents whole.
function splitTitle(title: string): [string, string] {
  const colon = title.indexOf(":");
  if (colon > 0 && colon < title.length - 1) {
    return [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  }
  const space = title.lastIndexOf(" ");
  if (space > 0) return [title.slice(0, space), title.slice(space + 1)];
  return ["", title];
}

export function CoverStory({
  kind,
  roundNumber,
  monthYear,
  games,
  votingResultsMessageId,
  absentNote,
}: {
  kind: VotingCategory;
  roundNumber: number;
  monthYear: string;
  games: GotmRoundGame[];
  votingResultsMessageId: string | null;
  // Shown under the masthead when the other track has no winner this round.
  absentNote?: string;
}) {
  const track = TRACK[kind];
  const winners = [...games]
    .sort((a, b) => a.game_index - b.game_index)
    .slice(0, 3);
  const count = winners.length;
  const sizes = SIZES[count] ?? SIZES[3];

  return (
    <section
      aria-label={`${track.label}, round ${roundNumber}${count > 1 ? `: ${count} winners` : ""}`}
      className={cn(
        "relative grid min-h-[30rem] gap-1 overflow-hidden rounded-md bg-ink lg:min-h-[32rem]",
        count === 2 && "sm:grid-cols-[1.42fr_1fr]",
        count === 3 && "sm:grid-cols-[1.3fr_1fr] sm:grid-rows-2",
      )}
    >
      <Starburst
        track={kind}
        className={cn(
          "absolute z-10",
          count === 1 && "top-7 right-8 size-32 sm:size-42",
          count === 2 &&
            "top-6 right-6 size-28 sm:right-auto sm:left-[calc(58.6%-4.6rem)] sm:size-37",
          count >= 3 &&
            "top-6 right-6 size-28 sm:right-auto sm:left-[calc(56.5%-10.5rem)] sm:size-35",
        )}
        textClassName={cn(
          kind === "nr_gotm" ? "text-[1.05rem] sm:text-xl" : "text-lg sm:text-2xl",
        )}
      />
      {winners.map((entry, i) => (
        <CoverPanel
          key={entry.gamedb_game_id ?? `index-${i}`}
          kind={kind}
          entry={entry}
          index={i}
          count={count}
          size={sizes[i]}
          lead={i === 0}
          roundNumber={roundNumber}
          monthYear={monthYear}
          votingResultsMessageId={votingResultsMessageId}
          absentNote={i === 0 ? absentNote : undefined}
        />
      ))}
    </section>
  );
}

function CoverPanel({
  kind,
  entry,
  index,
  count,
  size,
  lead,
  roundNumber,
  monthYear,
  votingResultsMessageId,
  absentNote,
}: {
  kind: VotingCategory;
  entry: GotmRoundGame;
  index: number;
  count: number;
  size: PanelSize;
  lead: boolean;
  roundNumber: number;
  monthYear: string;
  votingResultsMessageId: string | null;
  absentNote?: string;
}) {
  const track = TRACK[kind];
  const game = gotmCardProps(entry.game ?? null, UNKNOWN_GAME_TITLE);
  const [first, second] = splitTitle(game.title);
  const imageUrl = game.artUrl ?? game.coverUrl;
  const href = entry.gamedb_game_id ? `/games/${entry.gamedb_game_id}` : null;
  const small = size === "s";
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
    votingResultsMessageId,
  });
  // Narrow panels keep Reddit and the thread; the results link lives on the
  // lead, which every round has.
  const shownLinks = size === "m" || small ? links.slice(0, 2) : links;
  const single = count === 1;

  return (
    <article
      className={cn(
        "group/panel relative isolate flex min-h-80 overflow-hidden bg-black",
        count === 3 && lead && "sm:row-span-2",
      )}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[60%_30%] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/panel:scale-[1.03]"
        />
      )}
      {/* Legibility scrim: ink rises from the foot where the story sits; a
          single winner's cover also darkens its left half for the column. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          single
            ? "bg-[linear-gradient(90deg,rgb(11_11_13/0.96)_0%,rgb(11_11_13/0.82)_34%,rgb(11_11_13/0.15)_66%,rgb(11_11_13/0.35)_100%),linear-gradient(0deg,rgb(11_11_13/0.7)_0%,transparent_40%)]"
            : "bg-[linear-gradient(0deg,rgb(11_11_13/0.97)_0%,rgb(11_11_13/0.86)_30%,rgb(11_11_13/0.2)_62%,rgb(11_11_13/0.55)_100%)]",
        )}
      />

      <div
        className={cn(
          "flex w-full flex-col",
          small ? "p-5" : "p-6 sm:p-7",
        )}
      >
        {lead && (
          <div className="space-y-2">
            <div className="flex items-end gap-3.5">
              <p
                className={cn(
                  "font-headline text-[5.75rem] leading-[0.8] tracking-[-0.01em]",
                  track.number,
                )}
              >
                {roundNumber}
              </p>
              <p className="font-label pb-0.5 text-[0.95rem] leading-tight font-extrabold tracking-[0.08em] [text-shadow:0_1px_8px_rgb(0_0_0/0.85)]">
                Round {roundNumber}
                <span className="block font-bold text-paper-mute">
                  {monthYear}
                </span>
              </p>
            </div>
            {count > 1 && (
              <p className="font-label inline-flex rounded-xs bg-paper px-1.5 py-px text-[0.8rem] font-extrabold tracking-[0.08em] text-ink">
                {count} winners
              </p>
            )}
            {absentNote && (
              <p className="font-label flex items-center gap-2 text-[0.82rem] tracking-[0.08em] text-paper-mute [text-shadow:0_1px_8px_rgb(0_0_0/0.85)]">
                <span
                  aria-hidden
                  className="size-2.5 rounded-full ring-2 ring-gotm ring-inset"
                />
                {absentNote}
              </p>
            )}
          </div>
        )}

        <div className="mt-auto pt-6">
          <h2
            className={cn(
              "font-headline text-balance",
              TITLE_SIZE[size],
              single && "max-w-[11ch]",
            )}
          >
            {/* Co-winners are lettered in the track's ink, leading the
                headline's first line. */}
            {first && (
              <span className="block">
                <WinnerLetter count={count} index={index} className={track.number} />
                {first}
              </span>
            )}
            <span className={cn("block", track.accent)}>
              {!first && (
                <WinnerLetter count={count} index={index} className={track.number} />
              )}
              {second}
            </span>
          </h2>

          <div className={cn("flex flex-wrap gap-1.5", small ? "mt-2.5" : "mt-3.5")}>
            {game.year && (
              <span className="font-label inline-flex h-6 items-center rounded-xs bg-paper/8 px-2 text-[0.78rem] text-paper-dim">
                {game.year}
              </span>
            )}
            <PlatformPills platforms={game.platforms} max={small ? 2 : 4} />
          </div>

          {!small && game.description && (
            <p
              className={cn(
                "mt-3 line-clamp-3 text-paper-dim",
                single ? "max-w-[52ch] text-[0.97rem]" : "max-w-[46ch] text-sm",
              )}
            >
              {game.description}
            </p>
          )}

          <div
            className={cn(
              "flex flex-wrap items-center gap-x-1 gap-y-2",
              small ? "mt-3" : "mt-4",
            )}
          >
            {href && (
              <Link
                href={href}
                className={cn(
                  buttonVariants({ variant: track.button }),
                  "mr-2",
                )}
              >
                View game
                <ArrowRight data-icon="inline-end" />
              </Link>
            )}
            {shownLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label inline-flex items-center gap-1 px-1.5 py-1 text-[0.85rem] text-paper-dim transition-colors hover:text-highlight"
              >
                {link.label}
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function WinnerLetter({
  count,
  index,
  className,
}: {
  count: number;
  index: number;
  className: string;
}) {
  if (count < 2) return null;
  return (
    <span className={cn("mr-[0.3em]", className)}>
      {"ABC"[index]}
      <span className="sr-only">.</span>
    </span>
  );
}
