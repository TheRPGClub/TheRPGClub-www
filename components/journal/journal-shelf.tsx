import Link from "next/link";
import type { CSSProperties } from "react";
import type { JournalContributor } from "@/lib/api/types";
import { memberInk, spineHeight } from "@/lib/journals";
import { memberName } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// /journals' archive: one volume per member standing on a shelf, most games
// journaled first. The pulled volume stands proud with the selection ring;
// the rest lift a little on hover.
export function JournalShelf({
  contributors,
  pulledId,
  hrefFor,
  more,
}: {
  contributors: JournalContributor[];
  pulledId: string | null;
  hrefFor: (userId: string) => string;
  // The closing "N more volumes" spine, when the shelf is cut short.
  more?: { count: number; href: string };
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pt-5 sm:mx-0 sm:px-0">
      <ul
        aria-label="Member volumes"
        data-slot="journal-shelf"
        className="flex h-[262px] min-w-max items-end gap-1.5 border-b-[6px] border-border px-3"
      >
        {contributors.map((c) => {
          const name = memberName(c);
          const on = c.user_id === pulledId;
          return (
            <li key={c.user_id}>
              <Link
                href={hrefFor(c.user_id)}
                aria-current={on ? "true" : undefined}
                aria-label={`${name}: ${c.entry_count} ${c.entry_count === 1 ? "entry" : "entries"} on ${c.game_count} ${c.game_count === 1 ? "game" : "games"}`}
                data-slot="journal-spine"
                style={{ "--ink": memberInk(c.user_id), "--spine-h": `${spineHeight(c.user_id)}px` } as CSSProperties}
                className={cn(
                  "group relative flex w-14 flex-col items-center rounded-t-sm pb-2.5 motion-safe:transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:ring-3 focus-visible:ring-highlight/60 focus-visible:outline-none",
                  on
                    ? "-translate-y-[18px] bg-card shadow-[inset_0_0_0_1.5px_var(--color-highlight),0_12px_30px_rgb(0_0_0/0.5)]"
                    : "bg-muted shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_8%,transparent)] motion-safe:hover:-translate-y-1.5",
                )}
              >
                <span aria-hidden data-slot="journal-spine-cap" className="mb-2.5 h-2 w-full rounded-t-sm bg-(--ink)" />
                <span
                  aria-hidden
                  data-slot="journal-spine-title"
                  className="font-label truncate text-[0.95rem] font-extrabold tracking-[0.06em] group-hover:text-highlight"
                >
                  {name}
                </span>
                <span aria-hidden className="font-headline mt-auto text-center text-[1.35rem] leading-none">
                  {c.entry_count}
                  <small className="font-label mt-0.5 block text-[0.72rem] tracking-[0.08em] text-faint-foreground">
                    Entries
                  </small>
                </span>
              </Link>
            </li>
          );
        })}
        {more && more.count > 0 && (
          <li>
            <Link
              href={more.href}
              data-slot="journal-spine"
              data-variant="more"
              className="flex h-[180px] w-14 items-center justify-center rounded-t-sm shadow-[inset_0_0_0_1px_var(--color-border-strong)] transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-highlight/60 focus-visible:outline-none"
            >
              <span data-slot="journal-spine-title" className="font-label text-[0.95rem] font-extrabold tracking-[0.06em] text-dim-foreground">
                {more.count} more {more.count === 1 ? "volume" : "volumes"}
              </span>
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
