import type { UpcomingRelease } from "@/lib/api/types";
import { firstReleasedLabel } from "@/lib/release-calendar";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";
import { EntryTitle } from "./entry-title";
import { RegionChips } from "./region-chips";

// One Upcoming Release in the list: cover, title, its platforms by region
// and, when the game came out before, "First released Sep 2025".
export function AgendaEntry({ entry, past }: { entry: UpcomingRelease; past: boolean }) {
  const first = firstReleasedLabel(entry);
  return (
    <li className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[54px_minmax(0,1fr)] sm:gap-4">
      <GameCover
        title={entry.game.title}
        coverUrl={entry.game.cover_url}
        className={cn("w-full", past && "opacity-55")}
        fallbackClassName="p-1 text-[0.45rem]"
      />
      <div className="min-w-0">
        <EntryTitle
          gameId={entry.game.game_id}
          title={entry.game.title}
          past={past}
          className="mt-px mb-2 block text-base sm:text-[1.0625rem]"
        />
        <RegionChips entry={entry} past={past} />
        {first && (
          <p className="mt-1.5 text-[0.8125rem] leading-[1.3] text-faint-foreground">
            First released {first}
          </p>
        )}
      </div>
    </li>
  );
}
