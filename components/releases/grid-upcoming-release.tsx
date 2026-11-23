import { firstReleasedLabel, type CalendarEntry } from "@/lib/release-calendar";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";
import { GameTitle } from "./game-title";
import { RegionChips } from "./region-chips";

// An Upcoming Release in a day of the month grid: a small cover, the title
// on two lines at most, and its platforms by region. A day cell has no room
// for "First released ...", so it rides in the title link's accessible name
// and the tooltip over the whole Upcoming Release. One only on the member's
// Hidden Platforms, back for a "Show all" visit, is marked.
export function GridUpcomingRelease({ upcoming, past }: { upcoming: CalendarEntry; past: boolean }) {
  const { title, game_id: gameId, cover_url: coverUrl } = upcoming.game;
  const first = firstReleasedLabel(upcoming);
  return (
    <li
      title={first ? `${title}\nFirst released ${first}` : undefined}
      className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-[7px]"
    >
      <GameCover
        title={title}
        coverUrl={coverUrl}
        className={cn("w-full", past && "opacity-55")}
        fallbackClassName="p-0.5 text-[0.25rem]"
      />
      <div className="min-w-0">
        <GameTitle
          gameId={gameId}
          title={title}
          label={first ? `${title}, first released ${first}` : undefined}
          past={past}
          className="mb-1 line-clamp-2 text-[0.78rem] leading-[1.2]"
        />
        {upcoming.hiddenOnly && (
          <Badge tone="secondary" size="sm" className="mb-1">
            Hidden
          </Badge>
        )}
        <RegionChips upcoming={upcoming} past={past} compact />
      </div>
    </li>
  );
}
