import Link from "next/link";

import { patchDay, patchTitle } from "@/lib/patch-notes/format";
import { patchPath } from "@/lib/patch-notes/paths";
import { NO_PATCH_SEEN, isUnseenPatch, type PatchSeen } from "@/lib/patch-notes/patch-mark";
import type { Patch } from "@/lib/patch-notes/types";
import { cn } from "@/lib/utils";
import { NewMark } from "./new-mark";

// Every Patch by number (www#236), the Stack's right column: Anton numerals
// with the title and the day beside them, newest first. The Patch on top of
// the stack wears the yellow selection ring; an unseen Patch carries NEW
// beside its day (www#238).
export function PatchList({
  patches,
  current,
  seen = NO_PATCH_SEEN,
}: {
  patches: readonly Patch[];
  current?: number;
  seen?: PatchSeen;
}) {
  return (
    <nav aria-labelledby="patch-list-heading">
      <h2
        id="patch-list-heading"
        className="font-label mb-1.5 border-b-2 border-border-strong pb-2 text-[0.8125rem] font-bold tracking-[0.09em] text-dim-foreground"
      >
        Patches
      </h2>
      <ol>
        {patches.map((patch) => {
          const here = patch.number === current;
          return (
            <li key={patch.number}>
              <Link
                href={patchPath(patch.number)}
                aria-current={here ? "true" : undefined}
                className={cn(
                  "group my-1 grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3.5 rounded-sm px-2.5 py-2 outline-none",
                  "transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-highlight",
                  here && "bg-muted shadow-[inset_0_0_0_2px_var(--color-highlight)]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "font-headline text-center text-[2.75rem] leading-none",
                    here ? "text-foreground" : "text-dim-foreground group-hover:text-foreground",
                  )}
                >
                  {patch.number}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate font-semibold text-foreground group-hover:text-highlight">
                    {patch.title?.trim() && <span className="sr-only">Patch {patch.number}: </span>}
                    {patchTitle(patch)}
                  </span>
                  <span className="flex items-center gap-2">
                    <time
                      dateTime={patch.published_at ?? undefined}
                      className="font-label text-xs leading-none font-bold tracking-[0.08em] text-faint-foreground"
                    >
                      {patchDay(patch)}
                    </time>
                    {isUnseenPatch(patch.number, seen) && <NewMark />}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
