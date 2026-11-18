import {
  calendarHref,
  dateGroups,
  monthNote,
  monthOf,
  monthTitle,
  shiftMonth,
  type CalendarFilters,
  type CalendarView,
} from "@/lib/release-calendar";
import { AgendaGroups } from "./agenda-groups";
import { CalendarBand } from "./calendar-band";
import { CalendarGrid } from "./calendar-grid";
import { CalendarMini } from "./calendar-mini";
import { CalendarNote, type NoteLinks } from "./calendar-note";

// The grid's month: its Day TBA band, then the wall calendar from lg, or on
// a phone the tile grid over that month's days as a list. With nothing to
// show, a note lies over the grid (from lg) or under the tiles.
export function MonthView({
  view,
  filters,
  today,
  failed,
}: {
  view: CalendarView;
  filters: CalendarFilters;
  today: string;
  failed: boolean;
}) {
  const href = (change: Partial<CalendarFilters>) => calendarHref(filters, change, today);
  const prev = shiftMonth(filters.month, -1);
  const next = shiftMonth(filters.month, 1);
  const copy = failed
    ? {
        title: `Couldn't load ${monthTitle(filters.month)}`,
        body: "The Release Calendar couldn't be read just now. Try again in a moment.",
        clear: false,
      }
    : monthNote(view, filters, today);
  const links: NoteLinks = failed
    ? {}
    : {
        clear: copy?.clear ? href({ platforms: [] }) : undefined,
        prev: { href: href({ month: prev }), label: monthTitle(prev) },
        next: { href: href({ month: next }), label: monthTitle(next) },
        today: filters.month === monthOf(today) ? undefined : href({ month: monthOf(today) }),
      };
  const note = (overlay: boolean) =>
    copy && (
      <CalendarNote title={copy.title} links={links} overlay={overlay} className={overlay ? undefined : "mt-4"}>
        {copy.body}
      </CalendarNote>
    );
  const days = view.grid.filter((e) => e.date_precision === "day");

  return (
    <>
      <CalendarBand entries={view.grid} today={today} />
      <div className="hidden lg:block">
        <CalendarGrid month={filters.month} byDay={view.byDay} today={today}>
          {note(true)}
        </CalendarGrid>
      </div>
      <div className="lg:hidden">
        <CalendarMini month={filters.month} byDay={view.byDay} today={today} />
        {note(false)}
        {days.length > 0 && (
          <div className="mt-1.5">
            <AgendaGroups groups={dateGroups(days)} month={filters.month} today={today} />
          </div>
        )}
      </div>
    </>
  );
}
