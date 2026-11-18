import type { UpcomingRelease } from "@/lib/api/types";
import { GRID_WEEKDAYS, fullDayLabel, monthGrid } from "@/lib/release-calendar";
import { cn } from "@/lib/utils";
import { GridUpcomingRelease } from "./grid-upcoming-release";

// The month as a wall calendar (from lg): Monday first, each day listing its
// Upcoming Releases. Days before today step back; today is outlined in red,
// "you are here". The days either side of the month stay blank. A screen
// reader hears each day's full date ("Tuesday 17 November") before its
// games. `children` is laid over the grid (the empty and no-match notes).
export function CalendarGrid({
  month,
  byDay,
  today,
  children,
}: {
  month: string;
  byDay: Map<string, UpcomingRelease[]>;
  today: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mt-4 grid grid-cols-7 border-t border-l border-border">
      {GRID_WEEKDAYS.map((name) => (
        <div
          key={name}
          aria-hidden
          className="font-label border-r border-b border-border bg-card px-2.5 pt-2.5 pb-2 text-[0.78rem] leading-none font-extrabold tracking-[0.08em] text-faint-foreground"
        >
          {name}
        </div>
      ))}
      {monthGrid(month).map(({ day, inMonth, weekend }) => {
        const upcomingReleases = inMonth ? (byDay.get(day) ?? []) : [];
        const past = day < today;
        const isToday = day === today;
        return (
          <div
            key={day}
            className={cn(
              "flex min-h-33 min-w-0 flex-col gap-2 border-r border-b border-border p-2 pb-2.5",
              weekend && "bg-foreground/[0.015]",
              isToday && inMonth && "shadow-[inset_0_0_0_2px_var(--color-gotm)]",
            )}
          >
            {inMonth && (
              <span className="sr-only">
                {isToday ? "Today, " : ""}
                {fullDayLabel(day)}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "font-headline grid h-7 min-w-7 place-items-center self-start rounded-xs text-[1.2rem] leading-none",
                !inMonth && "invisible",
                isToday
                  ? "rounded-none text-gotm shadow-[inset_0_-2px_0_var(--color-gotm)]"
                  : past
                    ? "text-faint-foreground"
                    : "text-dim-foreground",
              )}
            >
              {Number(day.slice(8))}
            </span>
            {upcomingReleases.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {upcomingReleases.map((upcoming) => (
                  <GridUpcomingRelease key={upcoming.game.game_id} upcoming={upcoming} past={past} />
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {children}
    </div>
  );
}
