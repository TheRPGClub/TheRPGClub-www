import { Suspense, type CSSProperties, type ReactNode } from "react";
import type { Game } from "@/lib/api/types";
import { uniqueUsers } from "@/lib/api/game-counts";
import { fetchGameThreads, type GamePageShow } from "@/lib/games/game-page";
import { fetchSavedHltb } from "@/lib/games/saved-hltb";
import { latestMember } from "@/lib/games/hero-panel";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { GameHltb, GameHltbSkeleton } from "@/components/issue/game-hltb";
import { LatestLine, PanelMembers } from "@/components/issue/game-rail";
import { GameThreads } from "@/components/game-links/game-threads";

const plateClass =
  "relative mx-4 mb-4 rounded-md bg-background/84 ring-1 ring-foreground/10 ring-inset backdrop-blur-[6px] sm:mx-7 md:mx-8 md:mb-6.5";

// The club's numbers for the game on a translucent ink plate over the hero's
// foot (design www#156, round 3): Time to beat, Playing now, Completed by and
// Discord threads, side by side from `md` with hairlines between. On a phone
// the plate is two columns: Time to beat and the threads take a full row,
// Playing now and Completed by share one. Sections the viewer isn't shown
// (or a game without threads) leave the rest to share the width.
export async function GameHeroPanel({ game, show }: { game: Game; show: GamePageShow }) {
  // Start Time to beat's read now: GameHltb only renders once the threads
  // are in, and picks this same read up (fetchSavedHltb is per-request).
  void fetchSavedHltb(game.game_id);
  const threads = await fetchGameThreads(game.game_id);
  const playing = game.now_playing ?? [];
  const completions = game.completions ?? [];
  const playingNow = latestMember(playing, (e) => e.added_at, "day");
  const lastDone = latestMember(completions, (e) => e.completed_at, "month");

  const sections: { key: string; weight: number; wide: boolean; node: ReactNode }[] = [
    {
      key: "hltb",
      weight: 1.3,
      wide: true,
      node: (
        <Suspense fallback={<GameHltbSkeleton />}>
          <GameHltb gameId={game.game_id} title={game.title} releaseDate={game.initial_release_date} />
        </Suspense>
      ),
    },
  ];
  const pair = show.playing && show.completed;
  if (show.playing) {
    sections.push({
      key: "playing",
      weight: 1,
      wide: !pair,
      node: (
        <PanelMembers
          title="Playing now"
          users={uniqueUsers(playing)}
          empty="No one is playing this right now."
          latest={playingNow && <LatestLine latest={playingNow} verb="started" />}
        />
      ),
    });
  }
  if (show.completed) {
    sections.push({
      key: "completed",
      weight: 1,
      wide: !pair,
      node: (
        <PanelMembers
          title="Completed by"
          users={uniqueUsers(completions)}
          empty="No one has finished it yet."
          latest={lastDone && <LatestLine latest={lastDone} verb="latest" />}
        />
      ),
    });
  }
  if (threads?.length) {
    sections.push({ key: "threads", weight: 1.3, wide: true, node: <GameThreads threads={threads} /> });
  }

  const cols = { "--panel-cols": sections.map((s) => `minmax(0,${s.weight}fr)`).join(" ") } as CSSProperties;
  return (
    <div aria-label="The club on this game" role="group" style={cols} className={cn(plateClass, "grid grid-cols-2 md:grid-cols-(--panel-cols)")}>
      {sections.map((section, i) => (
        <div
          key={section.key}
          className={cn(
            "min-w-0 p-3 md:px-4.5 md:py-3.5",
            section.wide ? "col-span-2 md:col-span-1" : "md:col-span-1",
            i > 0 && "border-border max-md:border-t md:border-l",
            // The second of the phone's shared row: a hairline between them.
            !section.wide && sections[i - 1] && !sections[i - 1].wide && "max-md:border-l",
          )}
        >
          {section.node}
        </div>
      ))}
    </div>
  );
}

export function GameHeroPanelSkeleton() {
  return (
    <div className={plateClass}>
      <Skeleton variant="control" className="h-40 w-full" />
    </div>
  );
}
