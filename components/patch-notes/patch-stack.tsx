import type { ReactNode } from "react";

import { patchDate, patchTitle, stackNote } from "@/lib/patch-notes/format";
import { patchPath } from "@/lib/patch-notes/paths";
import { patchValue } from "@/lib/patch-notes/patch-schema";
import type { Patch } from "@/lib/patch-notes/types";
import { PageHeader } from "@/components/templates/page-header";
import { PatchCard } from "./patch-card";
import { PatchList } from "./patch-list";
import { PatchSlips } from "./patch-slips";

// Older Patches shown as slips under the top card; the Patches list beside
// the stack holds every one.
export const SLIPS_MAX = 9;

const SLIP = "rounded-md border border-dashed border-border-strong px-5 py-10 text-center text-dim-foreground";

// /patch-notes, "The Stack" (www#236): the newest Patch on top in full as
// the Patch card, the older ones as slips stepping down beneath it, and the
// Patches list in the right column (the Versions block joins it with
// www#241). For Visitors and Members alike.
export function PatchStack({ patches, badge }: { patches: Patch[] | null; badge?: ReactNode }) {
  const [newest, ...older] = patches ?? [];
  return (
    <div className="pb-10">
      <PageHeader title="Patch Notes" badge={badge} count={patches && patches.length > 0 ? stackNote(patches) : null} />
      {!patches ? (
        <p className={`mt-6 ${SLIP}`}>Couldn&apos;t load Patch Notes. Try again in a moment.</p>
      ) : !newest ? (
        <p className={`mt-6 ${SLIP}`}>
          No Patches yet. When the site or the bot changes, it&apos;s written up here.
        </p>
      ) : (
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,46.5rem)_minmax(16rem,1fr)] lg:gap-14">
          <section aria-label="Newest Patch">
            <PatchCard
              number={newest.number}
              title={patchTitle(newest)}
              date={patchDate(newest)}
              dateTime={newest.published_at}
              value={patchValue(newest.rich_body)}
              href={patchPath(newest.number)}
            />
            <PatchSlips patches={older.slice(0, SLIPS_MAX)} />
          </section>
          <aside className="lg:pt-0.5">
            <PatchList patches={patches} current={newest.number} />
          </aside>
        </div>
      )}
    </div>
  );
}
