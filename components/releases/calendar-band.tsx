import type { UpcomingRelease } from "@/lib/api/types";
import { dateGroups, firstReleasedLabel } from "@/lib/release-calendar";
import { isPast, periodTitle, precisionNote } from "@/lib/releases";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";
import { FirstReleased } from "./first-released";
import { GameTitle } from "./game-title";
import { RegionChips } from "./region-chips";

// The grid month's vague Upcoming Releases, above the grid: the month's own
// "Day TBA" ones and, in a quarter's or a year's last month, those too. One
// band per date; a band whose period has ended steps back. Each says "First
// released ..." when its game came out before.
export function CalendarBand({ upcomingReleases, today }: { upcomingReleases: UpcomingRelease[]; today: string }) {
  const groups = dateGroups(upcomingReleases.filter((u) => u.date && u.date_precision !== "day"));
  return groups.map((group) => {
    const past = isPast(group.date, group.precision, today);
    const period = periodTitle(group.date, group.precision);
    return (
      <section
        key={group.key}
        aria-label={`${precisionNote(group.precision)}, ${period}`}
        className="mt-4 flex flex-col items-stretch gap-3 rounded-md bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[22px]"
      >
        <div className="flex items-center gap-2.5 border-b border-border-strong pb-2.5 sm:flex-col sm:items-start sm:gap-1.5 sm:border-r sm:border-b-0 sm:pr-[18px] sm:pb-0">
          <Badge tone="precision">{precisionNote(group.precision)}</Badge>
          <span className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground">{period}</span>
        </div>
        {/* Safari drops a `contents` list's role; role="list" keeps it. */}
        <ul role="list" className="contents">
          {group.upcomingReleases.map((upcoming) => (
            <li
              key={upcoming.game.game_id}
              className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 sm:grid-cols-[34px_auto]"
            >
              <GameCover
                title={upcoming.game.title}
                coverUrl={upcoming.game.cover_url}
                className={cn("w-full", past && "opacity-55")}
                fallbackClassName="p-0.5 text-[0.3rem]"
              />
              <div className="min-w-0">
                <GameTitle
                  gameId={upcoming.game.game_id}
                  title={upcoming.game.title}
                  past={past}
                  className="mb-1 block text-[0.9rem]"
                />
                <RegionChips upcoming={upcoming} past={past} compact />
                <FirstReleased label={firstReleasedLabel(upcoming)} className="mt-1 text-xs" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}
