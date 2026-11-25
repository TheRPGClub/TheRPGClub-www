import type { GotyVoteSummary } from "@/lib/goty/types";
import { gotyTimeline } from "@/lib/goty/view";
import { cn } from "@/lib/utils";

// The banner's schedule: a line from set-up to the runoff, filled in paper
// up to now, with a tick per step (date over step name, alternating heights
// so the January steps don't collide) and the masthead-red "Now" marker
// (the Red Is Also Here Rule: where you are on a schedule). Phones keep
// the first three steps' dates only.
export function GotyTimeline({ vote, now }: { vote: GotyVoteSummary; now: number }) {
  const { ticks, now: at } = gotyTimeline(vote, now);
  return (
    <div role="img" aria-label={timelineLabel(ticks)} className="relative mt-1.5 mr-2 ml-1 h-[58px] md:mt-2.5 md:mr-10 md:ml-1.5 md:h-16">
      <div className="absolute inset-x-0 top-2.5 h-0.5 bg-border-strong">
        <span className="block h-full bg-foreground" style={{ width: `${at}%` }} />
      </div>
      {ticks.map((tick, i) => {
        const past = tick.at <= at;
        const last = i === ticks.length - 1;
        const low = i % 2 === 1;
        return (
          <span
            key={tick.name}
            aria-hidden
            style={{ left: `${tick.at}%` }}
            className={cn(
              "absolute top-1 flex-col gap-px pt-4 whitespace-nowrap before:absolute before:top-0.5 before:-left-px before:h-2.5 before:w-0.5 before:bg-current",
              tick.major ? "flex" : "hidden md:flex",
              past ? "text-dim-foreground" : "text-faint-foreground",
              low && "md:pt-[34px] md:before:h-7",
              last ? "-translate-x-full items-end before:right-[-1px] before:left-auto" : "items-start",
            )}
          >
            <span className={cn("font-label text-[0.78rem] font-extrabold tracking-[0.08em] uppercase", tick.major && "text-foreground")}>
              {tick.date}
            </span>
            <span className="hidden text-[0.72rem] md:inline">{tick.name}</span>
          </span>
        );
      })}
      <span aria-hidden style={{ left: `${at}%` }} className="absolute -top-1.5 h-[34px] border-l-3 border-gotm">
        <span className="font-label absolute -top-3.5 -left-3.5 text-[0.72rem] font-extrabold tracking-[0.08em] text-gotm-soft uppercase">
          Now
        </span>
      </span>
    </div>
  );
}

function timelineLabel(ticks: { date: string; name: string }[]): string {
  return `Schedule: ${ticks.map((t) => `${t.name} ${t.date}`).join(", ")}`;
}
