import Link from "next/link";
import type { YearDialStops } from "@/components/issue/member-year-dial-months";
import { cn } from "@/lib/utils";

// The year dial on a phone: a wrapping row of years above the spotlight.
export function YearRow({ years, current, all }: YearDialStops) {
  return (
    <nav aria-label="Choose a year" data-slot="year-dial" data-variant="row">
      <ul className="flex flex-wrap gap-1">
        {all && (
          <li>
            <Link
              href={all.href}
              aria-current={all.on ? "page" : undefined}
              className={cn(
                "font-label inline-flex h-8 items-center rounded-[3px] px-2.5 text-[0.88rem] font-extrabold tracking-[0.06em]",
                all.on ? "bg-foreground text-background" : "text-dim-foreground hover:bg-muted",
              )}
            >
              All
            </Link>
          </li>
        )}
        {years.map((year) => {
          const on = year.key === current;
          return (
            <li key={year.key}>
              <Link
                href={year.href}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-[3px] px-2.5",
                  on ? "bg-foreground text-background" : "text-dim-foreground hover:bg-muted",
                )}
              >
                <span className="font-headline text-lg leading-none">
                  {year.label}
                </span>
                <span className="font-label text-xs font-extrabold">
                  {year.count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
