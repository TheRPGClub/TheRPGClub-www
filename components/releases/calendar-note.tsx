import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NoteLinks {
  clear?: string;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
  today?: string;
}

// What the calendar says where it has nothing to show: a month with no
// Upcoming Releases, or a platform filter that leaves none. Laid over the
// month grid from lg (`overlay`), in the flow elsewhere. Its links lead on:
// show all platforms, the months either side, back to today.
export function CalendarNote({
  title,
  children,
  links,
  overlay = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  links: NoteLinks;
  overlay?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-[3px] border border-dashed border-border-strong bg-background px-4 py-4 sm:px-6 sm:py-[22px]",
        overlay && "absolute top-1/2 left-1/2 w-[min(640px,86%)] -translate-x-1/2 -translate-y-[38%]",
        className,
      )}
    >
      <h3 className="font-headline mb-2 text-2xl leading-[0.95] text-balance sm:text-3xl">{title}</h3>
      <p className="mb-3.5 max-w-[62ch] leading-normal text-dim-foreground">{children}</p>
      <div className="flex flex-wrap gap-2">
        {links.clear && (
          <ButtonLink href={links.clear} variant="outline" size="sm">
            <X data-icon="inline-start" aria-hidden />
            Show all platforms
          </ButtonLink>
        )}
        {links.prev && (
          <ButtonLink href={links.prev.href} variant="ghost" size="sm">
            <ChevronLeft data-icon="inline-start" aria-hidden />
            {links.prev.label}
          </ButtonLink>
        )}
        {links.next && (
          <ButtonLink href={links.next.href} variant="ghost" size="sm">
            {links.next.label}
            <ChevronRight data-icon="inline-end" aria-hidden />
          </ButtonLink>
        )}
        {links.today && (
          <ButtonLink href={links.today} variant="ghost" size="sm">
            Back to today
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
