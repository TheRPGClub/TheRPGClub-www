import { dayAnchor, type DateGroup } from "@/lib/release-calendar";
import { isPast } from "@/lib/releases";
import { AgendaUpcomingRelease } from "./agenda-upcoming-release";
import { DateColumn } from "./date-column";

// One date in the list: the date column beside every Upcoming Release on
// it. A day group carries an anchor the phone's month grid links to.
export function AgendaGroup({ group, today }: { group: DateGroup; today: string }) {
  const past = isPast(group.date, group.precision, today);
  return (
    <div
      id={group.precision === "day" && group.date ? dayAnchor(group.date) : undefined}
      className="grid break-inside-avoid scroll-mt-20 grid-cols-[78px_minmax(0,1fr)] border-b border-border py-3.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:py-4"
    >
      <DateColumn date={group.date} precision={group.precision} past={past} />
      <ul className="flex flex-col gap-4">
        {group.upcomingReleases.map((upcoming) => (
          <AgendaUpcomingRelease key={upcoming.game.game_id} upcoming={upcoming} past={past} />
        ))}
      </ul>
    </div>
  );
}

// The red line at today, in today's month, across every column.
export function TodayRule({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="font-label mt-3.5 flex items-center [column-span:all] gap-2.5 text-[0.78rem] leading-none font-extrabold tracking-[0.08em] text-gotm after:h-0.5 after:flex-1 after:bg-gotm"
    >
      {label}
    </div>
  );
}
