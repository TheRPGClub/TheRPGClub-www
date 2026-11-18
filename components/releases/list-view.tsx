import { calendarHref, listNote, type CalendarFilters, type CalendarView } from "@/lib/release-calendar";
import { CalendarNote } from "./calendar-note";
import { ReadCapNote } from "./read-cap-note";
import { ReleaseList } from "./release-list";

// Below the grid: every other Upcoming Release from today on. It never
// moves with the grid, so a past month shows only up top.
export function ListView({
  view,
  filters,
  today,
  failed,
  truncated,
}: {
  view: CalendarView;
  filters: CalendarFilters;
  today: string;
  failed: boolean;
  truncated: boolean;
}) {
  const copy = failed
    ? {
        title: "Couldn't load what's coming up",
        body: "The Upcoming Releases from today couldn't be read just now. Try again in a moment.",
        clear: false,
      }
    : listNote(view, filters);

  return (
    <div className="mt-2 sm:mt-4">
      {copy ? (
        <CalendarNote
          title={copy.title}
          links={{ clear: copy.clear ? calendarHref(filters, { platforms: [] }, today) : undefined }}
          className="mt-10 sm:mt-14"
        >
          {copy.body}
        </CalendarNote>
      ) : (
        <ReleaseList upcomingReleases={view.list} today={today} />
      )}
      {truncated && <ReadCapNote what="Upcoming Releases from today" className="mt-6" />}
    </div>
  );
}
