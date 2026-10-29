import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { GotmRoundGame } from "@/lib/api/types";
import { gotmCardProps } from "@/components/gotm-card";
import { PlatformPills } from "@/components/platform-pills";
import { buttonVariants } from "@/components/ui/button";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// The issue's NR-GOTM feature beside the GOTM cover story: one winner is a
// feature card (art band, blurb, links), two or three a ranked list of
// covers. Server-only (the Discord link config reads server env vars).

const UNKNOWN_GAME_TITLE = "Unknown game";
const LABEL = "Non-RPG Game of the Month";

export function NrFeature({
  roundNumber,
  games,
  votingResultsMessageId,
}: {
  roundNumber: number;
  games: GotmRoundGame[];
  votingResultsMessageId: string | null;
}) {
  const winners = [...games]
    .sort((a, b) => a.game_index - b.game_index)
    .slice(0, 3);

  if (winners.length === 1) {
    return (
      <FeatureCard
        roundNumber={roundNumber}
        entry={winners[0]}
        votingResultsMessageId={votingResultsMessageId}
      />
    );
  }

  return (
    <section
      aria-label={`${LABEL}, round ${roundNumber}: ${winners.length} winners`}
      className="relative flex flex-col overflow-hidden rounded-md border border-rule bg-ink-2"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-nr" />
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2.5">
        <h2 className="font-label rounded-xs bg-nr px-2 py-0.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-white">
          {LABEL}
        </h2>
        <p className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-nr-soft">
          {winners.length} winners
        </p>
      </div>
      <ol className="flex flex-1 flex-col">
        {winners.map((entry, i) => {
          const game = gotmCardProps(entry.game ?? null, UNKNOWN_GAME_TITLE);
          const cover = game.coverUrl ?? game.artUrl;
          const href = entry.gamedb_game_id
            ? `/games/${entry.gamedb_game_id}`
            : null;
          const body = (
            <>
              <div
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-xs bg-ink-3 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-nr",
                  winners.length === 2 ? "h-22 w-16.5" : "h-[4.3rem] w-13",
                )}
              >
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <h3
                  className={cn(
                    "font-headline truncate",
                    winners.length === 2 ? "text-[2rem]" : "text-[1.7rem]",
                  )}
                >
                  {game.title}
                </h3>
                <p className="font-label mt-1 truncate text-[0.78rem] text-paper-mute">
                  <span className="font-headline mr-1.5 text-[0.95rem] text-nr-soft">
                    {"ABC"[i]}
                  </span>
                  {[game.year, ...(game.platforms ?? []).slice(0, 3).map((p) => p.platform_abbreviation ?? p.platform_name)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {href && (
                <ArrowRight
                  aria-hidden
                  className="size-4 text-paper-mute transition-colors group-hover/row:text-nr-soft"
                />
              )}
            </>
          );
          const rowClass =
            "group/row grid h-full grid-cols-[auto_1fr_auto] items-center gap-3.5 px-4 py-2";
          return (
            <li
              key={entry.gamedb_game_id ?? `index-${i}`}
              className="flex-1 border-t border-rule"
            >
              {href ? (
                <Link
                  href={href}
                  className={cn(rowClass, "transition-colors hover:bg-ink-3")}
                >
                  {body}
                </Link>
              ) : (
                <div className={rowClass}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function FeatureCard({
  roundNumber,
  entry,
  votingResultsMessageId,
}: {
  roundNumber: number;
  entry: GotmRoundGame;
  votingResultsMessageId: string | null;
}) {
  const game = gotmCardProps(entry.game ?? null, UNKNOWN_GAME_TITLE);
  const art = game.artUrl ?? game.coverUrl;
  const href = entry.gamedb_game_id ? `/games/${entry.gamedb_game_id}` : null;
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
    votingResultsMessageId,
  }).slice(0, 2);

  return (
    <section
      aria-label={`${LABEL}, round ${roundNumber}`}
      className="relative flex flex-col overflow-hidden rounded-md border border-rule bg-ink-2"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-1 bg-nr" />
      <div className={cn("relative shrink-0", art ? "h-32" : "h-16")}>
        {art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art}
            alt=""
            className="size-full object-cover object-[50%_35%]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-ink-2)_0%,transparent_65%)]"
        />
        <p className="font-label absolute top-4 left-4 rounded-xs bg-nr px-2 py-0.5 text-[0.82rem] font-extrabold tracking-[0.08em] text-white">
          {LABEL}
        </p>
      </div>
      <div
        className={cn(
          "relative flex flex-1 flex-col px-4.5 pb-4.5",
          art && "-mt-5",
        )}
      >
        <h2 className="font-headline text-[2.5rem] leading-[0.92] text-balance">
          {game.title}
        </h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {game.year && (
            <span className="font-label inline-flex h-6 items-center rounded-xs bg-paper/8 px-2 text-[0.78rem] text-paper-dim">
              {game.year}
            </span>
          )}
          <PlatformPills platforms={game.platforms} max={3} />
        </div>
        {game.description && (
          <p className="mt-2.5 line-clamp-3 text-sm text-paper-dim">
            {game.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-1 gap-y-2 pt-3.5">
          {href && (
            <Link
              href={href}
              className={cn(buttonVariants({ variant: "nr" }), "mr-1.5")}
            >
              View game
              <ArrowRight data-icon="inline-end" />
            </Link>
          )}
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label inline-flex items-center gap-1 px-1.5 py-1 text-[0.85rem] text-paper-dim transition-colors hover:text-nr-soft"
            >
              {link.label}
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
