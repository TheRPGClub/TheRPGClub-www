import Link from "next/link";
import type { UpcomingRelease } from "@/lib/api/types";
import { GRID_WEEKDAYS, dayAnchor, fullDayLabel, monthCount, monthGrid } from "@/lib/release-calendar";
import { cn } from "@/lib/utils";

// The month grid on a phone: each day a tile with a dot per Upcoming
// Release (three at most), and a day with any links down to it in the list
// beneath, named by its full date and count.
export function CalendarMini({
  month,
  byDay,
  today,
}: {
  month: string;
  byDay: Map<string, UpcomingRelease[]>;
  today: string;
}) {
  return (
    <div className="mt-4 grid grid-cols-7 gap-[3px]">
      {GRID_WEEKDAYS.map((name, i) => (
        <div
          key={i}
          aria-hidden
          className="font-label pt-1 pb-1.5 text-center text-[0.72rem] leading-none font-extrabold tracking-[0.08em] text-faint-foreground"
        >
          {name.charAt(0)}
        </div>
      ))}
      {monthGrid(month).map(({ day, inMonth }) => {
        const count = inMonth ? (byDay.get(day)?.length ?? 0) : 0;
        const past = day < today;
        const tile = cn(
          "font-headline flex h-[50px] flex-col items-center justify-center gap-1 rounded-sm text-[1.05rem] leading-none",
          !inMonth
            ? "invisible"
            : day === today
              ? "bg-background text-gotm shadow-[inset_0_0_0_2px_var(--color-gotm)]"
              : cn("bg-card", past ? "text-faint-foreground" : "text-dim-foreground"),
        );
        const body = (
          <>
            <span aria-hidden>{Number(day.slice(8))}</span>
            <span aria-hidden className="flex h-[5px] gap-[3px]">
              {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                <span
                  key={i}
                  className={cn("size-[5px] rounded-full", past ? "bg-faint-foreground" : "bg-foreground")}
                />
              ))}
            </span>
          </>
        );
        return count > 0 ? (
          <Link
            key={day}
            href={`#${dayAnchor(day)}`}
            aria-label={`${fullDayLabel(day)}: ${monthCount(count, month, today)}`}
            className={cn(tile, "transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight")}
          >
            {body}
          </Link>
        ) : (
          <div key={day} aria-hidden={!inMonth} className={tile}>
            {inMonth && <span className="sr-only">{fullDayLabel(day)}</span>}
            {body}
          </div>
        );
      })}
    </div>
  );
}
