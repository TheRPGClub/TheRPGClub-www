import Link from "next/link";
import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import { OutboundLinks, TRACK_LABEL, UNKNOWN_GAME_TITLE } from "@/components/issue/gotm-shared";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

// One winner's art panel in the GOTM ledger: its key art, its title hanging
// from a fixed line, the track chip and its outbound links.
export function GotmLedgerPanel({
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
        "group/panel relative isolate flex min-h-38 w-full overflow-hidden rounded-sm bg-muted after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 md:min-h-49",
        kind === "gotm" ? "after:bg-gotm" : "after:bg-nr",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={art}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/panel:scale-[1.03]"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_96%,transparent)_0%,color-mix(in_oklab,var(--color-background)_60%,transparent)_42%,color-mix(in_oklab,var(--color-background)_5%,transparent)_75%)]"
      />
      {single && (
        <WinnerMark track={kind} className="absolute top-3 right-3 size-14" />
      )}
      {/* The whole panel opens the game; the link row sits above it. */}
      {href && (
        <Link
          href={href}
          aria-label={`View ${title}`}
          className="absolute inset-0 z-10 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none focus-visible:ring-inset"
        />
      )}
      {/* Titles hang from a fixed line so co-winners in a row align; the
          track chip and links sit on the panel's floor. */}
      <div className="flex w-full flex-col px-4 pt-16 pb-3.5 md:pt-20">
        <h4
          className={cn(
            "font-headline leading-[0.92] text-balance",
            single ? "text-[1.75rem] md:text-[2rem]" : "text-[1.45rem]",
          )}
        >
          {title}
        </h4>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2.5">
          <span
            className={cn(
              "font-label inline-block rounded-xs px-1.75 py-px text-[0.75rem] font-extrabold tracking-[0.1em] text-white",
              kind === "gotm" ? "bg-gotm" : "bg-nr",
            )}
          >
            {TRACK_LABEL[kind]}
          </span>
          <OutboundLinks links={shownLinks} />
        </div>
      </div>
    </article>
  );
}
