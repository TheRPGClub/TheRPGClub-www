import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackLink } from "@/components/shell/back-link";

// The production desk's page head: the page name set big in Anton on a
// paper rule, with a short tracked-caps note on the right (who is at the
// desk, a count, the viewer's zone). Wraps the note under the title on a
// phone. Every Wave 2 /admin page opens with this instead of PageHeader.
//
//   <DeskHeader title="Synonyms" side={<><b>38 groups</b> · 91 terms<br />A search for one term finds the rest</>} />
//
// `<b>` inside `side` reads in paper; the rest is muted. `back` sets the
// nested page's BackLink above the title (a desk tool's way to the desk).
export function DeskHeader({
  title,
  side,
  back,
  className,
}: {
  title: ReactNode;
  side?: ReactNode;
  back?: { href: string; label: string };
  className?: string;
}) {
  return (
    <header
      data-slot="desk-header"
      className={cn(
        "grid items-end gap-x-5 gap-y-2 border-b-2 border-foreground pb-3 md:grid-cols-[minmax(0,1fr)_auto]",
        className,
      )}
    >
      {back && <BackLink {...back} className="mb-1 md:col-span-2" />}
      <h1 className="font-headline text-[3.4rem] leading-[0.85] text-balance md:text-[5.25rem]">
        {title}
      </h1>
      {side && (
        <div className="font-label text-[0.9rem] leading-[1.4] tracking-[0.08em] text-faint-foreground md:text-right [&_b]:font-bold [&_b]:text-foreground">
          {side}
        </div>
      )}
    </header>
  );
}
