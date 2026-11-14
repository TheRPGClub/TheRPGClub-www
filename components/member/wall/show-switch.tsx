import Link from "next/link";
import { SHOW_OPTIONS, type Show } from "@/lib/members/members-wall";
import { cn } from "@/lib/utils";

// The wall's switch: Everyone, Staff or Regulars, each with its count, as
// links (the choice is the address's ?show=).

export function ShowSwitch({
  current,
  counts,
}: {
  current: Show;
  counts: Record<Show, number>;
}) {
  return (
    <nav
      aria-label="Show members"
      className="flex w-full overflow-hidden rounded-sm border border-border-strong sm:inline-flex sm:w-auto"
    >
      {SHOW_OPTIONS.map((option) => {
        const active = option.value === current;
        return (
          <Link
            key={option.value}
            href={option.value === "everyone" ? "/members" : `/members?show=${option.value}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "font-label inline-flex h-9.5 flex-1 items-center justify-center gap-2 border-l border-border-strong px-3.5 text-[0.92rem] font-extrabold tracking-[0.06em] whitespace-nowrap transition-colors first:border-l-0 sm:flex-none",
              active
                ? "bg-foreground text-background"
                : "text-dim-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
            <span
              className={cn(
                "text-[0.78rem] tabular-nums",
                active ? "text-background/60" : "text-faint-foreground",
              )}
            >
              {counts[option.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
