// A year with nothing recorded between two chapters (2B): one line on a
// hairline, the year small in the strong rule's ink.
export function YearGap({ year }: { year: number }) {
  return (
    <div className="flex items-baseline gap-4.5 border-t border-border pt-2.5 pb-3">
      <span className="font-headline text-[1.75rem] leading-[0.85] text-border-strong sm:text-[2.5rem]">{year}</span>
      <span className="font-label text-[0.8125rem] leading-none font-bold tracking-[0.08em] text-faint-foreground uppercase">
        Nothing recorded
      </span>
    </div>
  );
}
