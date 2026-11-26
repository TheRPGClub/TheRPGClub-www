import type { ReactNode } from "react";

import { patchDate, patchLongDate, patchTitle } from "@/lib/patch-notes/format";
import { patchValue } from "@/lib/patch-notes/patch-schema";
import type { PatchWithNeighbours } from "@/lib/patch-notes/types";
import { versionLine, type Versions } from "@/lib/patch-notes/versions";
import { PatchBody } from "./patch-body";
import { PatchCover } from "./patch-cover";
import { PatchFoot, type PatchNeighbour } from "./patch-foot";
import { PatchLedger } from "./patch-ledger";

// /patch-notes/<number> (www#236), the owner's mix of Cover and The Insert:
// the cover band, then a 268px left bar behind a 2px paper rule beside the
// whole text at 68ch, then the running foot.
export function PatchPage({
  patch,
  titles,
  versions = null,
  badge,
}: {
  patch: PatchWithNeighbours;
  // Published Patches' titles by number, for the foot; empty when the list
  // couldn't be read.
  titles: ReadonlyMap<number, string>;
  // The current versions, centred in the foot; null hides them.
  versions?: Versions | null;
  badge?: ReactNode;
}) {
  const value = patchValue(patch.rich_body);
  const neighbour = (number: number | null): PatchNeighbour | null =>
    number === null ? null : { number, title: titles.get(number) ?? null };
  return (
    <div className="flex flex-1 flex-col">
      <PatchCover
        number={patch.number}
        title={patchTitle(patch)}
        date={patchLongDate(patch)}
        dateTime={patch.published_at}
        badge={badge}
      />
      <div className="mt-7 grid gap-7 md:mt-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-0 md:px-7 lg:grid-cols-[16.75rem_minmax(0,1fr)]">
        <div className="border-b border-border pb-5 md:border-b-0 md:border-r-2 md:border-r-foreground md:pr-7 md:pb-0">
          <PatchLedger date={patchDate(patch)} dateTime={patch.published_at} counts={patch.counts} />
        </div>
        <div className="min-w-0 md:pl-9">
          {value.length > 0 ? (
            <PatchBody value={value} voice="page" />
          ) : (
            <p className="text-dim-foreground">This Patch has no text yet.</p>
          )}
        </div>
      </div>
      <div className="mt-auto">
        <PatchFoot
          previous={neighbour(patch.previous_number)}
          next={neighbour(patch.next_number)}
          middle={versionLine(versions)}
        />
      </div>
    </div>
  );
}
