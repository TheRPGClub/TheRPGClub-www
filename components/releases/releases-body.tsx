import { notFound } from "next/navigation";
import { fetchUpcomingReleases } from "@/lib/api/release-calendar";
import { fetchHiddenPlatforms } from "@/lib/api/hidden-platforms";
import { getSession } from "@/lib/session";
import { calendarView, upcomingCount, type CalendarFilters } from "@/lib/release-calendar";
import { PageHeader } from "@/components/templates/page-header";
import { CalendarToolbar } from "./calendar-toolbar";
import { MonthView } from "./month-view";
import { ListView } from "./list-view";
import { HiddenPlatformsNote } from "./hidden-platforms-note";

// The Release Calendar once the member is let in: the grid's month and
// everything from today on are read together. The list leaves out what the grid
// shows, and the platform filter narrows both. The API leaves out the
// member's Hidden Platforms unless "Show all" is on for the visit; their
// list is read beside, for the filter and the note under the toolbar.
export async function ReleasesBody({
  filters,
  today,
  badge,
}: {
  filters: CalendarFilters;
  today: string;
  badge: React.ReactNode;
}) {
  const userId = (await getSession())?.principal.discord_id;
  const read = { showHidden: filters.showHidden, userId };
  const [monthRead, fromTodayRead, hiddenRead] = await Promise.all([
    fetchUpcomingReleases(filters.month, read),
    fetchUpcomingReleases(undefined, read),
    userId ? fetchHiddenPlatforms(userId) : null,
  ]);
  // The flag changed after the page's gate ran.
  if (monthRead === "not_found" || fromTodayRead === "not_found") notFound();
  const hidden = hiddenRead === "not_found" ? null : hiddenRead;
  const hiddenIds = hidden?.platform_ids ?? [];
  const view = calendarView(
    monthRead?.upcomingReleases ?? null,
    fromTodayRead?.upcomingReleases ?? null,
    filters.platforms,
    filters.showHidden ? hiddenIds : [],
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
        hidden={hidden?.platforms ?? null}
      />
      <HiddenPlatformsNote
        filters={filters}
        today={today}
        names={hidden?.platforms.map((p) => p.platform_name) ?? []}
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
