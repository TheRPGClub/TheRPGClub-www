import Link from "next/link";
import { cn } from "@/lib/utils";

// The completed list's year dial: every year the member finished something
// in, newest first, with the chosen year opened out into its months. A month
// jumps to its frames in the filmstrip (on whichever page they fall). On a
// phone it folds into a wrapping row of years above the spotlight.

export interface DialYear {
  // "2026", or "unknown" for completions with no date.
  key: string;
  label: string;
  count: number;
  href: string;
}

export interface DialMonth {
  key: string; // "2026-08"
  label: string; // "Aug"
  count: number;
  href: string | null; // null: nothing finished that month
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function dialMonths(
  year: string,
  counts: Map<string, { count: number; href: string }>,
): DialMonth[] {
  // Newest month first, to match the strip.
  return MONTH_LABELS.map((label, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    const hit = counts.get(key);
    return { key, label, count: hit?.count ?? 0, href: hit?.href ?? null };
  }).reverse();
}

export function YearDial({
  years,
  current,
  months,
  all,
  layout = "rail",
}: {
  // The desktop rail down the right edge, or the phone's row of years.
  layout?: "rail" | "row";
  years: DialYear[];
  current: string | null;
  months: DialMonth[];
  // The "every year" stop, shown while a search spans all years.
  all?: { href: string; count: number | null; on: boolean };
}) {
  if (layout === "rail")
    return (
      <nav
        aria-label="Choose a year"
        className="sticky top-20 flex max-h-[calc(100svh-6rem)] flex-col items-center gap-0.5 overflow-y-auto border-l border-rule py-2.5"
      >
        {all && (
          <Link
            href={all.href}
            aria-current={all.on ? "page" : undefined}
            className={cn(
              "font-label mb-1 w-14 rounded-[3px] py-1 text-center text-[0.8rem] font-extrabold tracking-[0.08em] transition-colors",
              all.on
                ? "bg-paper text-ink"
                : "text-paper-mute hover:bg-ink-3 hover:text-paper",
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
                  on ? "text-paper" : "text-paper-mute hover:text-highlight",
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
                      className="font-label w-12 rounded-[3px] py-0.5 text-center text-[0.8rem] font-extrabold tracking-[0.08em] text-paper-dim transition-colors hover:bg-ink-3 hover:text-paper"
                    >
                      {month.label}
                    </Link>
                  ) : (
                    <span
                      key={month.key}
                      aria-hidden
                      className="font-label w-12 py-0.5 text-center text-[0.8rem] font-extrabold tracking-[0.08em] text-rule-strong"
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

  return (
    <nav aria-label="Choose a year">
      <ul className="flex flex-wrap gap-1">
        {all && (
          <li>
            <Link
              href={all.href}
              aria-current={all.on ? "page" : undefined}
              className={cn(
                "font-label inline-flex h-8 items-center rounded-[3px] px-2.5 text-[0.88rem] font-extrabold tracking-[0.06em]",
                all.on ? "bg-paper text-ink" : "text-paper-dim hover:bg-ink-3",
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
                  on ? "bg-paper text-ink" : "text-paper-dim hover:bg-ink-3",
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
