import Link from "next/link";
import type { YearDialStops } from "@/components/issue/member-year-dial-months";
import { cn } from "@/lib/utils";

// The year dial as the desktop rail down the right edge: the chosen year
// opens out into its months.
export function YearRail({ years, current, months, all }: YearDialStops) {
  return (
    <nav
      aria-label="Choose a year"
      data-slot="year-dial"
      data-variant="rail"
      className="sticky top-20 flex max-h-[calc(100svh-6rem)] flex-col items-center gap-0.5 overflow-y-auto border-l border-border py-2.5"
    >
      {all && (
        <Link
          href={all.href}
          aria-current={all.on ? "page" : undefined}
          className={cn(
            "font-label mb-1 w-14 rounded-[3px] py-1 text-center text-[0.8rem] font-extrabold tracking-[0.08em] transition-colors",
            all.on
              ? "bg-foreground text-background"
              : "text-faint-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          All
        </Link>
      )}
      {years.map((year) => {
        const on = year.key === current;
        return (
          <div key={year.key} className="flex flex-col items-center gap-0.5">
            <Link
              href={year.href}
              aria-current={on ? "page" : undefined}
              title={`${year.count} completed`}
              className={cn(
                "font-headline mt-2 mb-1 px-1 leading-none transition-colors",
                year.key === "unknown" ? "text-base" : "text-xl",
                on ? "text-foreground" : "text-faint-foreground hover:text-highlight",
              )}
            >
              {year.label}
            </Link>
            {on &&
              months.map((month) =>
                month.href ? (
                  <Link
                    key={month.key}
                    href={month.href}
                    title={`${month.count} completed`}
                    className="font-label w-12 rounded-[3px] py-0.5 text-center text-[0.8rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {month.label}
                  </Link>
                ) : (
                  <span
                    key={month.key}
                    aria-hidden
                    className="font-label w-12 py-0.5 text-center text-[0.8rem] font-extrabold tracking-[0.08em] text-border-strong"
                  >
                    {month.label}
                  </span>
                ),
              )}
          </div>
        );
      })}
    </nav>
  );
}
