import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { gotmCardProps } from "@/components/gotm-card";
import { CoverActions } from "@/components/issue/cover-actions";
import { CoverMasthead } from "@/components/issue/cover-masthead";
import { CoverStats } from "@/components/issue/cover-stats";
import { CoverStoryText } from "@/components/issue/cover-story-text";
import { TRACK, type PanelSize } from "@/components/issue/cover-track";
import type { GameCounts } from "@/lib/api/game-counts";
import { gotmLinks } from "@/lib/gotm-links";
import { cn } from "@/lib/utils";

const UNKNOWN_GAME_TITLE = "Unknown game";

// One winner's panel of the cover story: its key art under a legibility
// scrim, the masthead band, then the story at the foot.
export function CoverPanel({
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
  counts,
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
  counts?: GameCounts;
}) {
  const game = gotmCardProps(entry.game ?? null, UNKNOWN_GAME_TITLE);
  const imageUrl = game.artUrl ?? game.coverUrl;
  const small = size === "s";
  const links = gotmLinks({
    redditUrl: entry.reddit_url,
    threadId: entry.thread_id,
    votingResultsMessageId,
  });
  const single = count === 1;

  return (
    <article
      className={cn(
        "group/panel relative isolate flex min-h-80 overflow-hidden bg-black",
        count === 3 && lead && "sm:row-span-2",
      )}
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
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
            ? "bg-[linear-gradient(90deg,color-mix(in_oklab,var(--color-background)_96%,transparent)_0%,color-mix(in_oklab,var(--color-background)_82%,transparent)_34%,color-mix(in_oklab,var(--color-background)_15%,transparent)_66%,color-mix(in_oklab,var(--color-background)_35%,transparent)_100%),linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_70%,transparent)_0%,transparent_40%)]"
            : "bg-[linear-gradient(0deg,color-mix(in_oklab,var(--color-background)_97%,transparent)_0%,color-mix(in_oklab,var(--color-background)_86%,transparent)_30%,color-mix(in_oklab,var(--color-background)_20%,transparent)_62%,color-mix(in_oklab,var(--color-background)_55%,transparent)_100%)]",
        )}
      />

      <div className={cn("flex w-full flex-col", small ? "p-5" : "p-6 sm:p-7")}>
        <CoverMasthead
          kind={kind}
          lead={lead}
          split={count === 2}
          count={count}
          roundNumber={roundNumber}
          monthYear={monthYear}
          absentNote={absentNote}
        />

        <div className="mt-auto pt-6">
          <CoverStoryText kind={kind} game={game} index={index} count={count} size={size} />

          {counts && (
            <CoverStats
              counts={counts}
              accent={TRACK[kind].accent}
              small={small}
              compact={small}
              narrow={size === "m"}
            />
          )}

          <CoverActions
            kind={kind}
            href={entry.gamedb_game_id ? `/games/${entry.gamedb_game_id}` : null}
            // Narrow panels keep Reddit and the thread; the results link lives
            // on the lead, which every round has.
            links={size === "m" || small ? links.slice(0, 2) : links}
            small={small}
          />
        </div>
      </div>
    </article>
  );
}
