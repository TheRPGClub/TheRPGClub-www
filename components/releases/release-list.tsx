import { calendarSections, sectionNote, upcomingCount } from "@/lib/release-calendar";
import type { UpcomingRelease } from "@/lib/api/types";
import { SectionHeading } from "@/components/templates/page-header";
import { AgendaGroups } from "./agenda-groups";

// Below the grid: every other Upcoming Release from today on, under the
// API's sections ("December 2026", "Q3 2027", "2027", "TBA"), each a run
// of date groups.
export function ReleaseList({ entries, today }: { entries: UpcomingRelease[]; today: string }) {
  return calendarSections(entries).map((section) => {
    const note = sectionNote(section.precision, section.title);
    return (
      <section key={section.title} aria-label={section.title} className="mt-8 sm:mt-10">
        <SectionHeading
          title={section.title}
          count={note ? `${upcomingCount(section.count)} · ${note}` : upcomingCount(section.count)}
        />
        <AgendaGroups groups={section.groups} month={section.month} today={today} />
      </section>
    );
  });
}
