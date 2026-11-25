import { dialArcs, dialPercent, formatPlaytime } from "@/lib/franchises/progress";
import type { FranchiseProgressMeter } from "@/lib/franchises/types";
import { cn } from "@/lib/utils";

// One dial (pick 1E): an upward semicircle with a segment per game, the
// done ones in paper, then N/M in Anton, the % and the dial's Playtime. On
// wide screens the numbers sit inside the arc; on phones and tablets under
// it, so they stay readable at small sizes. A meter with no games is a
// dashed arc ("No Mainline games yet"), never 0/0.

// Drawn at 200 units wide; the phone's stroke is the heavier one, so the
// arc is laid out for it.
const GEO = { width: 200, stroke: 21 };

export function ProgressDial({
  meter,
  label,
  shortLabel,
  empty,
  stamp,
}: {
  meter: FranchiseProgressMeter;
  label: string;
  // The phone's label ("Everything" for "Mainline + spin-offs").
  shortLabel?: string;
  // What an empty dial says, and the line under its label.
  empty: { text: string; note: string };
  stamp?: React.ReactNode;
}) {
  const dial = dialArcs(meter.done, meter.total, GEO);
  const pct = dialPercent(meter.done, meter.total);
  return (
    <div className="relative flex min-w-0 flex-col items-center px-1 text-center lg:px-2">
      <div className="relative grid w-full justify-items-center">
        <svg
          viewBox={`0 0 ${dial.width} ${dial.height}`}
          className="block h-auto w-full max-w-[200px] overflow-visible"
          aria-hidden
        >
          {dial.segments.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              strokeDasharray={dial.empty ? "3 5" : undefined}
              className={cn(
                dial.empty
                  ? "stroke-border-strong [stroke-width:4px]"
                  : cn("[stroke-width:21px] lg:[stroke-width:17px]", s.on ? "stroke-foreground" : "stroke-muted"),
              )}
            />
          ))}
        </svg>
        <div className="mt-1.5 flex flex-col items-center lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0">
          {pct === null ? (
            <p className="font-label max-w-[150px] text-[0.8rem] leading-[1.25] font-bold tracking-[0.07em] text-faint-foreground">
              {empty.text}
            </p>
          ) : (
            <>
              <p className="font-headline text-[1.7rem] leading-[0.82] whitespace-nowrap lg:text-[2.4rem] xl:text-[3rem]">
                {meter.done}
                <span className="ml-0.5 text-[0.5em] text-faint-foreground">/{meter.total}</span>
              </p>
              <p className="font-label mt-[3px] text-[0.8rem] leading-none font-extrabold tracking-[0.06em] text-dim-foreground lg:mt-1.5 lg:text-base">
                {pct}%
              </p>
            </>
          )}
        </div>
      </div>
      <p className={cn("font-headline mt-2 text-[0.95rem] leading-none lg:mt-3 lg:text-[1.3rem]", pct === null && "text-faint-foreground")}>
        {shortLabel ? (
          <>
            <span className="lg:hidden">{shortLabel}</span>
            <span className="hidden lg:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </p>
      <p className="font-label mt-[5px] text-[0.68rem] leading-[1.2] font-bold tracking-[0.08em] text-faint-foreground lg:text-[0.78rem]">
        {pct === null ? (
          empty.note
        ) : (
          <>
            <b className="font-bold text-foreground">{formatPlaytime(meter.playtime_minutes)}</b> Playtime
          </>
        )}
      </p>
      {stamp}
    </div>
  );
}
