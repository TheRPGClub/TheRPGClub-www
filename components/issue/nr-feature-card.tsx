import { ArrowRight, ExternalLink } from "lucide-react";
import type { GotmRoundGame } from "@/lib/api/types";
import { gotmCardProps } from "@/components/gotm-card";
import { PlatformPills } from "@/components/platform-pills";
import { ButtonLink } from "@/components/ui/button";
import { gotmLinks } from "@/lib/gotm-links";
import { countStats, type GameCounts } from "@/lib/api/game-counts";
import { LABEL, UNKNOWN_GAME_TITLE } from "@/components/issue/nr-feature-copy";
import { NrFeatureStats } from "@/components/issue/nr-feature-stats";
import { cn } from "@/lib/utils";

// The NR-GOTM feature when the round has one winner: an art band, the title,
// chips, blurb, the club's numbers and the links. Server-only (the Discord
// link config reads server env vars).
export function NrFeatureCard({
  roundNumber,
  entry,
  votingResultsMessageId,
  counts,
}: {
  roundNumber: number;
  entry: GotmRoundGame;
  votingResultsMessageId: string | null;
  counts?: GameCounts;
}) {
  const game = gotmCardProps(entry.game ?? null, UNKNOWN_GAME_TITLE);
  const art = game.artUrl ?? game.coverUrl;
  const href = entry.gamedb_game_id ? `/games/${entry.gamedb_game_id}` : null;
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
    votingResultsMessageId,
  }).slice(0, 2);
  const stats = counts ? countStats(counts) : [];

  return (
    <section
      aria-label={`${LABEL}, round ${roundNumber}`}
      className="relative flex flex-col overflow-hidden rounded-md border border-border bg-card"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-1 bg-nr" />
      {art && (
        // The art band takes whatever height the stretched card has spare,
        // so the story and its actions stay together at the foot.
        <div className="relative min-h-32 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art}
            alt=""
            className="absolute inset-0 size-full object-cover object-[50%_35%]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-card)_0%,transparent_65%)]"
          />
        </div>
      )}
      <div
        className={cn(
          "relative flex flex-col px-4.5 pb-4.5",
          art ? "-mt-5" : "flex-1 justify-end pt-6",
        )}
      >
        <h2 className="font-headline text-[2.5rem] leading-[0.92] text-balance">
          {game.title}
        </h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="font-label inline-flex h-6 items-center rounded-xs bg-nr px-2 text-[0.78rem] font-extrabold text-nr-foreground">
            Non-RPG GOTM
          </span>
          {game.year && (
            <span className="font-label inline-flex h-6 items-center rounded-xs bg-foreground/8 px-2 text-[0.78rem] text-dim-foreground">
              {game.year}
            </span>
          )}
          <PlatformPills platforms={game.platforms} max={3} />
        </div>
        {game.description && (
          <p className="mt-2.5 line-clamp-3 text-sm text-dim-foreground">
            {game.description}
          </p>
        )}
        {stats.length > 0 && <NrFeatureStats stats={stats} />}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 pt-3.5">
          {href && (
            <ButtonLink
              href={href}
              variant="nr"
              className="mr-1.5"
            >
              View game
              <ArrowRight data-icon="inline-end" />
            </ButtonLink>
          )}
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-label inline-flex items-center gap-1 px-1.5 py-1 text-[0.85rem] text-dim-foreground transition-colors hover:text-nr-soft"
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
