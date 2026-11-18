import { notFound } from "next/navigation";
import { fetchUpcomingReleases } from "@/lib/api/release-calendar";
import { calendarView, upcomingCount, type CalendarFilters } from "@/lib/release-calendar";
import { PageHeader } from "@/components/templates/page-header";
import { CalendarToolbar } from "./calendar-toolbar";
import { MonthView } from "./month-view";
import { ListView } from "./list-view";

// The Release Calendar once the member is let in: the grid's month and
// everything from today on are read together. The list leaves out what the grid
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
  const [monthRead, fromTodayRead] = await Promise.all([
    fetchUpcomingReleases(filters.month),
    fetchUpcomingReleases(),
  ]);
  // The flag changed after the page's gate ran.
  if (monthRead === "not_found" || fromTodayRead === "not_found") notFound();
  const view = calendarView(
    monthRead?.upcomingReleases ?? null,
    fromTodayRead?.upcomingReleases ?? null,
    filters.platforms,
  );

  return (
    <div>
      <PageHeader
        title="Release Calendar"
        badge={badge}
        actions={
          fromTodayRead && (
            <p className="font-label text-[0.8125rem] font-bold tracking-[0.08em] text-faint-foreground">
              From today · {upcomingCount(view.fromTodayCount)}
            </p>
          )
        }
      />
      <CalendarToolbar
        filters={filters}
        today={today}
        count={monthRead ? view.grid.length : null}
        options={view.options}
      />
      <MonthView
        view={view}
        filters={filters}
        today={today}
        failed={monthRead === null}
        truncated={monthRead?.truncated ?? false}
      />
      <ListView
        view={view}
        filters={filters}
        today={today}
        failed={fromTodayRead === null}
        truncated={fromTodayRead?.truncated ?? false}
      />
    </div>
  );
}
