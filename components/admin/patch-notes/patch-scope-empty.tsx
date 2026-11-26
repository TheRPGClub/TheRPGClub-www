import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

// Step 1, "What's in it", before versioning exists (www#237): no Pending
// Changes have arrived yet, so there is nothing to tick, and the Patch is
// written by hand in step 2. Once there are some, step 1 is PatchScope
// (www#240).
export function PatchScopeEmpty({ onWrite }: { onWrite: () => void }) {
  return (
    <section aria-labelledby="patch-scope-empty" className="max-w-[46rem] border-t-2 border-foreground pt-5">
      <div className="flex items-start gap-4 rounded-[3px] border border-dashed border-border-strong px-5 py-5">
        <Inbox aria-hidden className="mt-0.5 size-5 shrink-0 text-faint-foreground" strokeWidth={1.75} />
        <div className="flex flex-col gap-2">
          <h2 id="patch-scope-empty" className="font-label text-[0.9375rem] font-bold tracking-[0.08em]">
            No Pending Changes yet
          </h2>
          <p className="text-[0.9375rem] text-dim-foreground">
            Once versioning starts, every change merged since the last Patch shows here, sorted into New, Improved and
            Fixed, for you to tick into this Patch. Until then, write the Patch yourself.
          </p>
          <Button type="button" variant="outline" onClick={onWrite} className="mt-1 self-start">
            Go to 2 · Write it
          </Button>
        </div>
      </div>
    </section>
  );
}
