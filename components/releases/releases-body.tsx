import { notFound } from "next/navigation";
import { fetchUpcomingReleases } from "@/lib/api/release-calendar";
import { calendarView, upcomingCount, type CalendarFilters } from "@/lib/release-calendar";
import { PageHeader } from "@/components/templates/page-header";
import { CalendarToolbar } from "./calendar-toolbar";
import { MonthView } from "./month-view";
import { ListView } from "./list-view";

// The Release Calendar once the member is let in: the grid's month and the
// window from today are read together. The list leaves out what the grid
// shows, and the platform filter narrows both.
export async function ReleasesBody({
  filters,
  today,
  badge,
}: {
  filters: CalendarFilters;
  today: string;
  badge: React.ReactNode;
}) {
  const [month, window] = await Promise.all([
    fetchUpcomingReleases(filters.month),
    fetchUpcomingReleases(),
  ]);
  // The flag changed after the page's gate ran.
  if (month === "not_found" || window === "not_found") notFound();
  const view = calendarView(month?.entries ?? null, window?.entries ?? null, filters.platforms);

  return (
    <div>
      <PageHeader
        title="Release Calendar"
        badge={badge}
        actions={
          window && (
            <p className="font-label text-[0.8125rem] font-bold tracking-[0.08em] text-faint-foreground">
              From today · {upcomingCount(view.fromToday)}
            </p>
          )
        }
      />
      <CalendarToolbar
        filters={filters}
        today={today}
        count={month ? view.grid.length : null}
        options={view.options}
      />
      <MonthView view={view} filters={filters} today={today} failed={month === null} />
      <ListView
        view={view}
        filters={filters}
        today={today}
        failed={window === null}
        truncated={window?.truncated ?? false}
      />
    </div>
  );
}
