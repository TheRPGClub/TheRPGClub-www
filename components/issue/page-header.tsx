import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Page and section headings in the masthead voice: an Anton title sitting on
// a paper rule, with an optional count and trailing actions on the same
// baseline. `PageHeader` opens a page; `SectionHeading` opens a department
// inside one.

export function PageHeader({
  title,
  count,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  // A tally beside the title, e.g. "312 games".
  count?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-b-2 border-paper pb-3">
        <h1 className="font-headline text-5xl text-balance sm:text-6xl">
          {title}
        </h1>
        {count != null && (
          <p className="font-label pb-1 text-sm text-paper-mute">{count}</p>
        )}
        {actions && (
          <div className="ml-auto flex flex-wrap items-center gap-2 pb-1">
            {actions}
          </div>
        )}
      </div>
      {description && (
        <p className="max-w-[65ch] text-paper-dim">{description}</p>
      )}
    </header>
  );
}

export function SectionHeading({
  title,
  count,
  action,
  as: Heading = "h2",
  className,
}: {
  title: ReactNode;
  count?: ReactNode;
  action?: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b-2 border-paper pb-2.5",
        className,
      )}
    >
      <Heading className="font-headline text-3xl">{title}</Heading>
      {count != null && (
        <span className="font-label text-sm text-paper-mute">{count}</span>
      )}
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

// The "All 112 rounds →" style trailing link used beside headings.
export const headingLinkClass =
  "font-label group inline-flex items-center gap-1.5 text-sm font-extrabold text-paper transition-colors hover:text-highlight [&_svg]:size-4 [&_svg]:text-gotm [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5";
