import type { UpcomingRelease } from "@/lib/api/types";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";
import { EntryTitle } from "./entry-title";
import { RegionChips } from "./region-chips";

// An Upcoming Release in a day of the month grid: a small cover, the title
// on two lines at most, and its platforms by region.
export function GridEntry({ entry, past }: { entry: UpcomingRelease; past: boolean }) {
  return (
    <li className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-[7px]">
      <GameCover
        title={entry.game.title}
        coverUrl={entry.game.cover_url}
        className={cn("w-full", past && "opacity-55")}
        fallbackClassName="p-0.5 text-[0.25rem]"
      />
      <div className="min-w-0">
        <EntryTitle
          gameId={entry.game.game_id}
          title={entry.game.title}
          past={past}
          className="mb-1 line-clamp-2 text-[0.78rem] leading-[1.2]"
        />
        <RegionChips entry={entry} past={past} compact />
      </div>
    </li>
  );
}
