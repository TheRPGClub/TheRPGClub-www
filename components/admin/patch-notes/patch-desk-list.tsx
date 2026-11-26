import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { patchEditPath } from "@/lib/patch-notes/editor-paths";
import { patchDate, patchTitle } from "@/lib/patch-notes/format";
import type { Patch } from "@/lib/patch-notes/types";
import { cn } from "@/lib/utils";

// The editor's list (www#237): drafts first, then published Patches, each a
// desk row on a hairline under the 2px paper rule: the number in Anton, the
// title, its state ("Draft" in highlighter yellow, "Published 26 Nov 2026")
// and its New / Improved / Fixed counts, then the arrow into the editor.
export function PatchDeskList({ patches }: { patches: readonly Patch[] }) {
  if (patches.length === 0) {
    return (
      <p className="rounded-[3px] border border-dashed border-border-strong px-4 py-3.5 text-[0.9375rem] text-dim-foreground">
        No Patches yet. Start the first one: it becomes Patch 1.
      </p>
    );
  }
  const ordered = [...patches.filter((p) => p.status === "draft"), ...patches.filter((p) => p.status !== "draft")];
  return (
    <ul className="border-t-2 border-foreground">
      {ordered.map((patch) => (
        <li key={patch.number} className="border-b border-border">
          <Link
            href={patchEditPath(patch.number)}
            className="group/row grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 rounded-xs py-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
          >
            <span aria-hidden className="font-headline text-center text-[2.5rem] leading-none text-dim-foreground group-hover/row:text-foreground">
              {patch.number}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-semibold transition-colors group-hover/row:text-highlight">
                {patch.title?.trim() && <span className="sr-only">Patch {patch.number}: </span>}
                {patchTitle(patch)}
              </span>
              <span className="font-label flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-bold tracking-[0.08em] text-faint-foreground">
                <span className={cn(patch.status === "draft" ? "text-highlight" : "text-foreground")}>
                  {patch.status === "draft" ? "Draft" : `Published ${patchDate(patch)}`}
                </span>
                <span>{countsLine(patch)}</span>
              </span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4.5 text-faint-foreground transition-[color,translate] group-hover/row:translate-x-0.5 group-hover/row:text-foreground motion-reduce:transition-none"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function countsLine(patch: Patch): string {
  const c = patch.counts ?? { new: 0, improved: 0, fixed: 0 };
  return `${c.new} new · ${c.improved} improved · ${c.fixed} fixed`;
}
