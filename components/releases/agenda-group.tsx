import { isPastEntry, type DateGroup } from "@/lib/release-calendar";
import { AgendaEntry } from "./agenda-entry";
import { DateColumn } from "./date-column";

// One date in the list: the date column beside every Upcoming Release on
// it. A day group carries an anchor the phone's month grid links to.
export function AgendaGroup({ group, today }: { group: DateGroup; today: string }) {
  const past = isPastEntry(group.entries[0], today);
  return (
    <div
      id={group.precision === "day" && group.date ? `rc-day-${group.date}` : undefined}
      className="grid scroll-mt-20 grid-cols-[78px_minmax(0,1fr)] border-b border-border py-3.5 sm:grid-cols-[104px_minmax(0,1fr)] sm:py-4"
    >
      <DateColumn date={group.date} precision={group.precision} past={past} />
      <ul className="flex flex-col gap-4">
        {group.entries.map((entry) => (
          <AgendaEntry key={`${entry.game.game_id}|${entry.date}`} entry={entry} past={past} />
        ))}
      </ul>
    </div>
  );
}

// The red line at today, in today's month.
export function TodayRule({ label }: { label: string }) {
  return (
    <div
      role="separator"
      aria-label={label}
      className="font-label mt-3.5 flex items-center gap-2.5 text-[0.78rem] leading-none font-extrabold tracking-[0.08em] text-gotm after:h-0.5 after:flex-1 after:bg-gotm"
    >
      {label}
    </div>
  );
}
