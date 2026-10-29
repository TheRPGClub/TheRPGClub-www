import Link from "next/link";
import {
  GOTM_HISTORY_PATH,
  GOTM_KIND_OPTIONS,
  gotmHistoryHref,
  hasActiveGotmFilters,
  type GotmHistoryFilters,
  type GotmKind,
} from "@/lib/api/gotm-rounds";
import { cn } from "@/lib/utils";

// The GOTM history's side rail: which track to show and which year, as
// links. Each keeps the other filters and the search, and starts from the
// first page.

const KIND_DOT: Partial<Record<GotmKind, string>> = {
  gotm: "bg-gotm",
  nr_gotm: "bg-nr",
};

export function GotmRail({
  filters,
  years,
}: {
  filters: GotmHistoryFilters;
  years: number[];
}) {
  // Keep a year from the URL selectable even when the list doesn't carry it.
  const yearOptions =
    filters.year && !years.includes(filters.year)
      ? [filters.year, ...years]
      : years;
  const href = (change: Partial<GotmHistoryFilters>) =>
    gotmHistoryHref({ ...filters, ...change, page: 1 });

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-21">
      <nav aria-labelledby="gotm-show">
        <h2 id="gotm-show" className={railLabel}>
          Show
        </h2>
        <ul className="flex flex-wrap gap-1 lg:grid lg:grid-cols-1">
          {GOTM_KIND_OPTIONS.map((option) => {
            const active = option.value === filters.kind;
            const dot = KIND_DOT[option.value];
            return (
              <li key={option.value}>
                <Link
                  href={href({ kind: option.value })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "font-label flex h-9.5 items-center justify-center gap-2.5 rounded-sm px-2.5 text-[0.82rem] font-extrabold tracking-[0.06em] transition-colors sm:text-[0.95rem] lg:justify-start",
                    active
                      ? "bg-paper text-ink"
                      : "text-paper-dim hover:bg-ink-3 hover:text-paper",
                  )}
                >
                  {dot && (
                    <span
                      aria-hidden
                      className={cn("size-2 shrink-0 rounded-full", dot)}
                    />
                  )}
                  {option.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {yearOptions.length > 0 && (
        <nav aria-labelledby="gotm-year">
          <h2 id="gotm-year" className={railLabel}>
            Year
          </h2>
          <ul className="flex flex-wrap gap-1">
            <li>
              <YearLink
                href={href({ year: null })}
                active={filters.year === null}
              >
                All
              </YearLink>
            </li>
            {yearOptions.map((year) => (
              <li key={year}>
                <YearLink
                  href={href({ year })}
                  active={filters.year === year}
                >
                  {year}
                </YearLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {hasActiveGotmFilters(filters) && (
        <Link
          href={GOTM_HISTORY_PATH}
          className="font-label self-start text-sm font-extrabold tracking-[0.06em] text-paper-dim underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight"
        >
          Clear filters
        </Link>
      )}
    </aside>
  );
}

const railLabel =
  "font-label mb-1.5 text-[0.8rem] font-extrabold tracking-[0.12em] text-paper-mute";

function YearLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "font-headline block rounded-xs px-2 py-1.25 text-[1.2rem] leading-none transition-colors",
        active
          ? "bg-paper text-ink"
          : "text-paper-dim hover:bg-ink-3 hover:text-paper",
      )}
    >
      {children}
    </Link>
  );
}
