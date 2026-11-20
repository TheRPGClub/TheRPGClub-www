import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  calendarHref,
  monthCount,
  monthOf,
  monthTitle,
  shiftMonth,
  type CalendarFilters,
  type PlatformOption,
} from "@/lib/release-calendar";
import type { HiddenPlatform } from "@/lib/hidden-platforms";
import { ButtonLink } from "@/components/ui/button";
import { PlatformFilter } from "./platform-filter";

// Over the grid: ‹ month ›, Today (filled while the grid is on today's
// month, since pressing it is how you get back), then the month's count ("8
// Upcoming Releases", or "8 Releases" for a month before today's) and the
// platform filter, which narrows the grid and the list together.
export function CalendarToolbar({
  filters,
  today,
  count,
  options,
  hidden,
}: {
  filters: CalendarFilters;
  today: string;
  // The grid month's Upcoming Releases after the filter; null when unread.
  count: number | null;
  options: PlatformOption[];
  // The member's Hidden Platforms; null when they couldn't be read.
  hidden: HiddenPlatform[] | null;
}) {
  const prev = shiftMonth(filters.month, -1);
  const next = shiftMonth(filters.month, 1);
  const current = filters.month === monthOf(today);
  return (
    <div className="mt-[18px] flex flex-wrap items-center gap-2">
      <ButtonLink
        href={calendarHref(filters, { month: prev }, today)}
        variant="outline"
        size="icon-lg"
        aria-label={`Previous month, ${monthTitle(prev)}`}
      >
        <ChevronLeft aria-hidden />
      </ButtonLink>
      <h2 className="font-headline min-w-0 flex-1 text-center text-[1.625rem] leading-[0.9] sm:mx-2 sm:min-w-[250px] sm:flex-none sm:text-4xl">
        {monthTitle(filters.month)}
      </h2>
      <ButtonLink
        href={calendarHref(filters, { month: next }, today)}
        variant="outline"
        size="icon-lg"
        aria-label={`Next month, ${monthTitle(next)}`}
      >
        <ChevronRight aria-hidden />
      </ButtonLink>
      <ButtonLink
        href={calendarHref(filters, { month: monthOf(today) }, today)}
        variant={current ? "selected" : "outline"}
        size="sm"
        aria-current={current ? "date" : undefined}
      >
        Today
      </ButtonLink>
      <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
        {count !== null && (
          <span className="font-label mr-1.5 hidden text-[0.8125rem] font-bold tracking-[0.08em] text-faint-foreground sm:inline">
            {monthCount(count, filters.month, today)}
          </span>
        )}
        <PlatformFilter filters={filters} today={today} options={options} hidden={hidden} />
      </div>
    </div>
  );
}
