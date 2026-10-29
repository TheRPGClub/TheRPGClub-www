import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// The import review's item: the source row as a card (art band when the
// source has art, the title in the masthead voice, its facts), the matching
// work under it, and beside it the other ways to find the game as
// collapsible routes.

export function ImportItemLayout({
  label,
  title,
  art,
  facts,
  children,
  routes,
}: {
  // Accessible name for the card, e.g. "Row 12".
  label: string;
  title: ReactNode;
  art?: ReactNode;
  facts?: ReactNode;
  children: ReactNode;
  // Collapsible panels for the other search routes; none gives the card
  // the full width.
  routes?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-start gap-5",
        routes && "xl:grid-cols-[minmax(0,1fr)_21rem]",
      )}
    >
      <section
        aria-label={label}
        className="overflow-hidden rounded-md border border-rule bg-ink-2"
      >
        {art && (
          <div className="relative h-36 sm:h-52">
            {art}
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-ink-2)_2%,transparent_70%)]"
            />
          </div>
        )}
        <div className={cn("relative px-4 sm:px-5.5", art ? "-mt-12 sm:-mt-16" : "pt-5")}>
          <h2 className="font-headline text-[2.4rem] leading-[0.88] break-words sm:text-[3.4rem]">
            {title}
          </h2>
          {facts && <div className="mt-3">{facts}</div>}
        </div>
        <div className="px-4 pt-5 pb-5 sm:px-5.5 sm:pb-5.5">{children}</div>
      </section>
      {routes && (
        <div aria-label="Other ways to find it" role="group" className="flex flex-col gap-2">
          {routes}
        </div>
      )}
    </div>
  );
}

// One collapsible search route beside the item.
export function ImportRoute({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group/route rounded-sm border border-rule bg-ink-2 open:border-rule-strong"
    >
      <summary className="font-label flex cursor-pointer list-none items-center gap-2.5 px-4 py-3.5 text-[0.95rem] font-extrabold tracking-[0.06em] transition-colors select-none hover:text-highlight [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden
          className="ml-auto size-4 text-paper-mute transition-transform group-open/route:rotate-180"
        />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

// The small tracked-caps heading inside a card's working area.
export function ImportSubhead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-label flex flex-wrap items-center gap-2.5 text-[0.95rem] font-extrabold tracking-[0.08em]",
        className,
      )}
    >
      {children}
    </h3>
  );
}
