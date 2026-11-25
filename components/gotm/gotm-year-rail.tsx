import type { ReactNode } from "react";
import Link from "next/link";
import {
  gotmHistoryHref,
  type GotmHistoryFilters as Filters,
} from "@/lib/api/gotm-rounds";
import { cn } from "@/lib/utils";

// The GOTM History's year rail: All, then every year with rounds, as links
// that keep the Category and order. A narrow column at the rows' left on a
// wide screen; a scrolling strip above them on a phone.
export function GotmYearRail({
  filters,
  years,
}: {
  filters: Filters;
  years: number[];
}) {
  // Keep a year from the URL selectable even when the list doesn't carry it.
  const options =
    filters.year && !years.includes(filters.year) ? [filters.year, ...years] : years;
  if (options.length === 0) return null;
  const href = (year: number | null) =>
    gotmHistoryHref({ ...filters, year, page: 1 });

  return (
    <nav aria-label="Year" className="min-w-0 lg:sticky lg:top-21 lg:self-start">
      <ul className="flex gap-4 overflow-x-auto border-b border-border pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-r lg:border-b-0 lg:pb-0">
        <li>
          <YearLink href={href(null)} active={filters.year === null}>
            All
          </YearLink>
        </li>
        {options.map((year) => (
          <li key={year}>
            <YearLink href={href(year)} active={filters.year === year}>
              {year}
            </YearLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function YearLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "-mb-px block border-b-2 py-1.75 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-highlight lg:-mr-px lg:mb-0 lg:border-r-2 lg:border-b-0 lg:pr-3",
        active
          ? "font-headline border-highlight text-[1.375rem] leading-none text-foreground"
          : "font-label border-transparent text-[0.95rem] font-semibold tracking-[0.06em] text-faint-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
