import type { ReactNode } from "react";
import type { Value } from "platejs";
import { ArrowRight } from "lucide-react";

import { patchText } from "@/lib/patch-notes/patch-text";
import { Button, ButtonLink } from "@/components/ui/button";
import { PatchBody } from "./patch-body";

// The Patch card (www#236, The Stack's top card): the newest Patch on
// /patch-notes, and the editor's live preview (www#237). It shows the same
// text and the same cut as the #patch-notes post (lib/patch-notes/
// patch-text), in site styling, never Discord's: the Anton numeral and the
// title on a 2px paper rule with the date, then the text, then the red
// "Read the full Patch" at the right (the owner's named exception to the
// red rule, DESIGN.md).
//
// Pure and server-safe, with no API reads, so the client editor can render
// it with its live value. `siteUrl` makes the site's own links whole as the
// save does, so the card cuts where the stored `cut_body` (the post) does.
export function PatchCard({
  number,
  title,
  date,
  dateTime,
  value,
  siteUrl = null,
  href,
  mark,
  headingLevel = 2,
}: {
  number: number;
  // The title as shown ("Patch 2" when it has none).
  title: string;
  // "26 Nov 2026"; empty for a draft.
  date: string;
  // The publish time, for the date's `dateTime`.
  dateTime?: string | null;
  // The whole Patch, sanitized: the card cuts it.
  value: Value;
  // The site's origin (siteUrl()), null when unknown.
  siteUrl?: string | null;
  // The Patch's page; null for a draft (the editor's preview), which has
  // none yet, so "Read the full Patch" shows disabled.
  href: string | null;
  // The unseen "NEW" chip (www#238), beside the date.
  mark?: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const { cutValue } = patchText(value, siteUrl ? { siteUrl } : {});
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      aria-labelledby={`patch-card-${number}`}
      data-slot="patch-card"
      className="relative z-10 rounded-md border border-border bg-card px-4 pt-4 pb-3.5 sm:px-5"
    >
      <header data-slot="patch-card-head" className="mb-3 flex items-end gap-3.5 border-b-2 border-foreground pb-2.5">
        <p className="flex shrink-0 flex-col items-center gap-1">
          <span className="font-label text-[0.6875rem] leading-none font-bold tracking-[0.12em] text-faint-foreground">
            Patch
          </span>
          <span className="font-headline text-[2.875rem] leading-[0.8]">{number}</span>
        </p>
        <div className="flex min-w-0 flex-col gap-1.5">
          {(date || mark) && (
            <p className="font-label flex flex-wrap items-center gap-2 text-xs leading-none font-bold tracking-[0.08em] text-faint-foreground">
              {date && <time dateTime={dateTime ?? undefined}>{date}</time>}
              {mark}
            </p>
          )}
          <Heading id={`patch-card-${number}`} className="font-headline text-[1.625rem] leading-none text-balance">
            {title}
          </Heading>
        </div>
      </header>
      {cutValue.length > 0 ? (
        <PatchBody value={cutValue} voice="card" />
      ) : (
        <p className="text-[0.9375rem] text-faint-foreground">Nothing written yet.</p>
      )}
      <div data-slot="patch-card-foot" className="mt-3 flex justify-end border-t border-border pt-3">
        {href ? (
          <ButtonLink href={href}>
            Read the full Patch<span className="sr-only"> {number}</span>
            <ArrowRight aria-hidden data-icon="inline-end" />
          </ButtonLink>
        ) : (
          <Button type="button" disabled>
            Read the full Patch<span className="sr-only"> {number} (once published)</span>
            <ArrowRight aria-hidden data-icon="inline-end" />
          </Button>
        )}
      </div>
    </article>
  );
}
