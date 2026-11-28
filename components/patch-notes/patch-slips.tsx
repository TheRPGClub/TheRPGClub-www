import Link from "next/link";

import { patchDate, patchTitle } from "@/lib/patch-notes/format";
import { patchPath } from "@/lib/patch-notes/paths";
import { NO_PATCH_SEEN, isUnseenPatch, type PatchSeen } from "@/lib/patch-notes/patch-mark";
import type { Patch } from "@/lib/patch-notes/types";
import { cn } from "@/lib/utils";
import { NewMark } from "./new-mark";

// The older Patches under the top card (www#236, The Stack): full-width,
// left-aligned slips tucked 12px under the one above and stepping straight
// down, the first a shade lighter. Each slip is a link to its Patch and
// lifts 2px on hover or focus; an unseen one carries NEW after its title.
export function PatchSlips({ patches, seen = NO_PATCH_SEEN }: { patches: readonly Patch[]; seen?: PatchSeen }) {
  if (patches.length === 0) return null;
  return (
    <nav aria-label="Older Patches">
      <ol>
        {patches.map((patch, i) => (
          <li key={patch.number} className="relative -mt-3" style={{ zIndex: 9 - Math.min(i, 8) }}>
            <Link
              href={patchPath(patch.number)}
              data-slot="patch-slip"
              data-variant={i === 0 ? "first" : undefined}
              className={cn(
                "group flex min-h-[3.375rem] items-center gap-3.5 rounded-b-md border border-t-0 border-border-strong px-4 pt-5 pb-2 outline-none sm:px-[18px]",
                i === 0 ? "bg-muted" : "bg-card",
                "motion-safe:transition-[translate,box-shadow] motion-safe:duration-200 motion-safe:ease-out",
                "hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-highlight",
              )}
            >
              <span aria-hidden className="font-headline w-7 shrink-0 text-center text-2xl leading-none text-dim-foreground group-hover:text-foreground">
                {patch.number}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-foreground group-hover:text-highlight">
                {patch.title?.trim() && <span className="sr-only">Patch {patch.number}: </span>}
                {patchTitle(patch)}
              </span>
              {isUnseenPatch(patch.number, seen) && <NewMark />}
              <time
                dateTime={patch.published_at ?? undefined}
                className="font-label shrink-0 text-xs font-bold tracking-[0.08em] text-faint-foreground"
              >
                {patchDate(patch)}
              </time>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
