import { calendarSections, sectionNote, upcomingCount } from "@/lib/release-calendar";
import type { UpcomingRelease } from "@/lib/api/types";
import { SectionHeading } from "@/components/templates/page-header";
import { AgendaGroups } from "./agenda-groups";

// Below the grid: every other Upcoming Release from today on, under the
// API's sections ("December 2026", "Q3 2027", "2027", "TBA"), each a run
// of date groups, set in two or three columns from sm.
export function ReleaseList({
  upcomingReleases,
  today,
}: {
  upcomingReleases: UpcomingRelease[];
  today: string;
}) {
  return calendarSections(upcomingReleases).map((section) => {
    const note = sectionNote(section);
    return (
      <section key={section.title} aria-label={section.title} className="mt-8 sm:mt-10">
        <SectionHeading
          title={section.title}
          count={note ? `${upcomingCount(section.count)} · ${note}` : upcomingCount(section.count)}
        />
        {/* Newspaper columns, read down then across: a long section no
            longer runs on in one narrow strip under the grid. */}
        <div className="gap-x-10 sm:columns-2 xl:columns-3">
          <AgendaGroups groups={section.groups} month={section.month} today={today} />
        </div>
      </section>
    );
  });
}
