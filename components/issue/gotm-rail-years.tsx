import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// The GOTM history rail's year links: All, then each year with rounds.

export const railLabel =
  "font-label mb-1.5 text-[0.8rem] font-extrabold tracking-[0.12em] text-faint-foreground";

export function GotmRailYears({
  years,
  current,
  href,
}: {
  years: number[];
  current: number | null;
  href: (year: number | null) => string;
}) {
  return (
    <nav aria-labelledby="gotm-year">
      <h2 id="gotm-year" className={railLabel}>
        Year
      </h2>
      <ul className="flex flex-wrap gap-1">
        <li>
          <YearLink
            href={href(null)}
            active={current === null}
          >
            All
          </YearLink>
        </li>
        {years.map((year) => (
          <li key={year}>
            <YearLink
              href={href(year)}
              active={current === year}
            >
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
        "font-headline block rounded-xs px-2 py-1.25 text-[1.2rem] leading-none transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-dim-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
