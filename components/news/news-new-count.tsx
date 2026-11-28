import type { CSSProperties } from "react";
import type { Catchup, InkSegment } from "@/lib/news-catchup";
import { cn } from "@/lib/utils";

// The hero band's left side: how many News Items are new since the
// member's News Mark ("23 NEW" in Anton, since when), then a bar split by
// News Category ink with a legend of per-category counts, Rumours hatched.
// With nothing new, or no mark yet, "All caught up" takes its place.

const HATCH =
  "bg-[repeating-linear-gradient(135deg,var(--news-ink)_0_3px,transparent_3px_6px)] outline-1 -outline-offset-1 outline-(--news-ink) outline-dashed";

export function NewsNewCount({
  catchup,
  since,
  segments,
}: {
  catchup: Catchup;
  // The mark as "Tuesday, 21:40"; null without one.
  since: string | null;
  segments: InkSegment[];
}) {
  if (catchup.state !== "new") {
    return (
      <div data-slot="news-caught-up" className="flex flex-col justify-end pb-1 lg:pt-2">
        <h2 id="news-count" className="font-headline text-[3.4rem] leading-[0.95] sm:text-[4.5rem]">
          All caught up
        </h2>
        <p className="font-label mt-3 text-[0.95rem] font-bold tracking-[0.08em] text-dim-foreground uppercase">
          {since ? `Nothing new since ${since}` : "New items are marked from your next visit"}
        </p>
      </div>
    );
  }
  return (
    <div data-slot="news-new-count" className="flex flex-col lg:pt-1.5">
      <h2 id="news-count" className="font-headline flex items-end gap-4 leading-[0.86] lg:block">
        <span className="text-[6.5rem] tracking-[-0.01em] tabular-nums sm:text-[8rem] lg:text-[9.4rem]">
          {catchup.newCount}
        </span>
        <span className="block pb-2 text-[3rem] leading-none text-highlight lg:mt-1.5 lg:pb-0 lg:text-[4.5rem]">
          New
        </span>
      </h2>
      {since && (
        <p className="font-label mt-3.5 text-[0.95rem] font-bold tracking-[0.08em] text-dim-foreground uppercase">
          since {since}
        </p>
      )}
      <InkBar segments={segments} />
    </div>
  );
}

function InkBar({ segments }: { segments: InkSegment[] }) {
  if (segments.length === 0) return null;
  return (
    <div className="mt-6 lg:mt-auto">
      <div aria-hidden data-slot="news-ink-bar" className="flex h-3.5 gap-0.5 overflow-hidden rounded-[2px]">
        {segments.map((s) => (
          <i
            key={s.key}
            style={{ "--news-ink": s.color, flexGrow: s.count } as CSSProperties}
            className={cn("block h-full basis-0", s.dashed ? HATCH : "bg-(--news-ink)")}
          />
        ))}
      </div>
      <ul aria-label="New by category" className="mt-3 grid grid-cols-2 gap-x-3.5 gap-y-1.5">
        {segments.map((s) => (
          <li
            key={s.key}
            className="font-label flex items-center gap-[7px] text-xs leading-none font-bold tracking-[0.06em] text-dim-foreground uppercase"
          >
            <i
              aria-hidden
              style={{ "--news-ink": s.color } as CSSProperties}
              className={cn(
                "size-[9px] shrink-0 rounded-[1px]",
                s.dashed ? "border-[1.5px] border-dashed border-(--news-ink)" : "bg-(--news-ink)",
              )}
            />
            <span className="min-w-0 truncate">{s.name}</span>
            <b className="ml-auto text-foreground tabular-nums">{s.count}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
