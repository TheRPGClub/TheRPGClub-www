import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The production desk's page head: the page name set big in Anton on a
// paper rule, with a short tracked-caps note on the right (who is at the
// desk, a count, the viewer's zone). Wraps the note under the title on a
// phone. Every Wave 2 /admin page opens with this instead of PageHeader.
//
//   <DeskHeader title="Synonyms" side={<><b>38 groups</b> · 91 terms<br />A search for one term finds the rest</>} />
//
// `<b>` inside `side` reads in paper; the rest is muted.
export function DeskHeader({
  title,
  side,
  className,
}: {
  title: ReactNode;
  side?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid items-end gap-x-5 gap-y-2 border-b-2 border-paper pb-3 md:grid-cols-[minmax(0,1fr)_auto]",
        className,
      )}
    >
      <h1 className="font-headline text-[3.4rem] leading-[0.85] text-balance md:text-[5.25rem]">
        {title}
      </h1>
      {side && (
        <div className="font-label text-[0.9rem] leading-[1.4] tracking-[0.08em] text-paper-mute md:text-right [&_b]:font-bold [&_b]:text-paper">
          {side}
        </div>
      )}
    </header>
  );
}
