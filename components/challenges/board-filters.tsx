import Link from "next/link";
import { boardHref, FORMAT_NAME, FORMATS, type BoardFilters, type OpenFilter } from "@/lib/challenges/board";
import { cn } from "@/lib/utils";
import { FormatSquare } from "@/components/challenges/format-mark";
import { Badge } from "@/components/ui/badge";

// The index's filter bar: All / Open / Closed as a segmented control, and the
// three Formats as chips (each with its ink square). Both are links, so a
// filter is a shareable address.

const OPEN: { value: OpenFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

export function BoardFiltersBar({ filters }: { filters: BoardFilters }) {
  return (
    <div data-slot="board-filters" className="flex flex-wrap items-center gap-x-2.5 gap-y-3">
      <nav aria-label="Open or Closed" className="w-full sm:w-auto">
        <ul className="inline-flex rounded-sm shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
          {OPEN.map(({ value, label }) => {
            const on = filters.open === value;
            return (
              <li key={value}>
                <Link
                  href={boardHref(filters, { open: value })}
                  scroll={false}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "font-label inline-flex h-[34px] items-center rounded-sm px-3.5 text-[0.88rem] tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-highlight",
                    on ? "bg-foreground text-background" : "text-faint-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <nav
        aria-label="Format"
        className="-mx-4 flex min-w-0 items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:ml-auto sm:px-0"
      >
        <span className="font-label mr-1 text-[0.82rem] tracking-[0.08em] text-faint-foreground">Format</span>
        {FORMATS.map((format) => {
          const on = filters.format === format;
          return (
            <Badge
              key={format}
              render={<Link href={boardHref(filters, { format: on ? null : format })} scroll={false} />}
              aria-current={on ? "page" : undefined}
              tone="option"
              size="filter"
              className="h-[30px] shrink-0 gap-[7px] border-0 px-2.5"
            >
              <FormatSquare format={format} />
              {FORMAT_NAME[format]}
            </Badge>
          );
        })}
      </nav>
    </div>
  );
}
