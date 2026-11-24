import Link from "next/link";
import type { PlayedFilter } from "@/lib/challenges/pool-wall";
import { cn } from "@/lib/utils";

// The Pool view's filter (All / Played by the club / Not played yet), kept
// in the address, with each count over both walls.
export function PoolFilter({
  filter,
  tabs,
  hrefFor,
}: {
  filter: PlayedFilter;
  tabs: { key: PlayedFilter; label: string; count: number }[];
  hrefFor: (change: { played?: PlayedFilter; all?: boolean }) => string;
}) {
  return (
    <nav aria-label="Played" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="inline-flex rounded-sm shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <Link
              href={hrefFor({ played: tab.key, all: false })}
              scroll={false}
              aria-current={tab.key === filter ? "page" : undefined}
              className={cn(
                "font-label inline-flex h-[34px] items-center gap-1.5 rounded-sm px-3.5 text-[0.88rem] tracking-[0.08em] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-highlight",
                tab.key === filter ? "bg-foreground text-background" : "text-faint-foreground hover:text-foreground",
              )}
            >
              {tab.label} <span>{tab.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
