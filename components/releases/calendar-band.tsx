import type { UpcomingRelease } from "@/lib/api/types";
import { precisionNote } from "@/lib/releases";
import { dateGroups, isPastEntry, periodTitle } from "@/lib/release-calendar";
import { Badge } from "@/components/ui/badge";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";
import { EntryTitle } from "./entry-title";
import { RegionChips } from "./region-chips";

// The grid month's vague Upcoming Releases, above the grid: the month's own
// "Day TBA" ones and, in a quarter's or a year's last month, those too. One
// band per date; a band whose period has ended steps back.
export function CalendarBand({ entries, today }: { entries: UpcomingRelease[]; today: string }) {
  const groups = dateGroups(entries.filter((e) => e.date && e.date_precision !== "day"));
  return groups.map((group) => {
    const past = isPastEntry(group.entries[0], today);
    return (
      <section
        key={group.key}
        aria-label={`${precisionNote(group.precision)}, ${periodTitle(group.date!, group.precision)}`}
        className="mt-4 flex flex-col items-stretch gap-3 rounded-md bg-card px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-[22px]"
      >
        <div className="flex items-center gap-2.5 border-b border-border-strong pb-2.5 sm:flex-col sm:items-start sm:gap-1.5 sm:border-r sm:border-b-0 sm:pr-[18px] sm:pb-0">
          <Badge tone="precision">{precisionNote(group.precision)}</Badge>
          <span className="font-label text-xs font-bold tracking-[0.08em] text-faint-foreground">
            {periodTitle(group.date!, group.precision)}
          </span>
        </div>
        <ul className="contents">
          {group.entries.map((entry) => (
            <li
              key={entry.game.game_id}
              className="grid grid-cols-[34px_minmax(0,1fr)] items-center gap-2.5 sm:grid-cols-[34px_auto]"
            >
              <GameCover
                title={entry.game.title}
                coverUrl={entry.game.cover_url}
                className={cn("w-full", past && "opacity-55")}
                fallbackClassName="p-0.5 text-[0.3rem]"
              />
              <div className="min-w-0">
                <EntryTitle
                  gameId={entry.game.game_id}
                  title={entry.game.title}
                  past={past}
                  className="mb-1 block text-[0.9rem]"
                />
                <RegionChips entry={entry} past={past} compact />
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  });
}
