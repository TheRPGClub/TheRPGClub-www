import type { ReactNode } from "react";

import { titleLines } from "@/lib/patch-notes/format";
import { PATCH_NOTES_BACK } from "@/lib/patch-notes/paths";
import { BackLink } from "@/components/shell/back-link";

// A Patch page's cover band (www#236, from Cover): Ink 2 across the content
// column over a 2px paper rule, the way back to Patch Notes, then the
// monumental numeral beside "Patch N / date" and the two-line Anton title,
// its second line dim. No counts here: they sit in the left bar.
export function PatchCover({
  number,
  title,
  date,
  dateTime,
  badge,
}: {
  number: number;
  title: string;
  date: string;
  dateTime: string | null;
  badge?: ReactNode;
}) {
  const [first, second] = titleLines(title);
  return (
    <header className="bleed -mt-6 border-b-2 border-foreground bg-card">
      <div className="mx-auto max-w-page px-4 pt-5 pb-7 sm:px-7 md:px-14 md:pb-9">
        <div className="flex items-center gap-3">
          <BackLink {...PATCH_NOTES_BACK} className="mb-0" />
          {badge}
        </div>
        <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-end gap-x-5 md:mt-10 md:gap-x-8">
          <p aria-hidden className="font-headline text-[6.5rem] leading-[0.8] tracking-[-0.02em] md:text-[10.5rem]">
            {number}
          </p>
          <div className="min-w-0 pb-1">
            <p className="font-label mb-2.5 text-[0.9375rem] leading-tight font-extrabold tracking-[0.08em] text-dim-foreground md:mb-3 md:text-base">
              <span className="text-foreground">Patch {number}</span>
              {date && (
                <>
                  {" / "}
                  <time dateTime={dateTime ?? undefined}>{date}</time>
                </>
              )}
            </p>
            <h1 className="font-headline text-[2.25rem] leading-[0.95] text-balance [overflow-wrap:anywhere] md:text-[4.25rem]">
              {first}
              {second && <span className="block text-dim-foreground">{second}</span>}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
