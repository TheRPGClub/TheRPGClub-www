import { cn } from "@/lib/utils";

// A note taped beside the sheet on the review desk: an ink-3 card with a
// strip of paper tape across its top and a slight hand-placed tilt (from
// `lg`, where the notes sit in the margin; stacked under the sheet on smaller
// screens they lie flat).
export function DeskNote({
  heading,
  aside,
  className,
  children,
}: {
  heading?: string;
  aside?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={heading}
      className={cn(
        "relative rounded-sm bg-muted px-4.5 pt-4.5 pb-4 shadow-[0_10px_24px_rgb(0_0_0/0.45)]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute -top-2 left-1/2 h-4.5 w-18 -translate-x-1/2 -rotate-2 bg-foreground/15"
      />
      {heading && (
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="font-headline text-[1.45rem] leading-none">{heading}</h3>
          {aside && (
            <span className="font-label text-[0.72rem] font-extrabold tracking-[0.08em] text-faint-foreground">
              {aside}
            </span>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
