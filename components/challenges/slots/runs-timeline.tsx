import Link from "next/link";
import type { Timeline } from "@/lib/challenges/slots-timeline";
import { LANE_GRID, TimelineLaneRow } from "@/components/challenges/slots/timeline-lane";

const SHOWN = 8;

// Everyone else's Runs on one shared year axis (surface brief
// challenges-slots, 3B): "Other Runs" on the 2px rule, the axis labelled
// every 5 years, a lane per member (eight, then "Show all"), and a legend.
// Tapping a lane opens that member's Run in the panel above (`?run=`).
export function RunsTimeline({
  challengeId,
  timeline,
  selected,
  showAll,
  birthYear,
}: {
  challengeId: number;
  timeline: Timeline | null;
  selected: string | null;
  showAll: boolean;
  // A birth-year range rings the birth year; a fixed one its first year.
  birthYear: boolean;
}) {
  const lanes = timeline?.lanes ?? [];
  const shown = showAll ? lanes : lanes.slice(0, SHOWN);
  const columns = timeline ? timeline.end - timeline.start + 1 : 1;
  const href = (userId: string) =>
    `/challenges/${challengeId}?run=${encodeURIComponent(userId)}${showAll ? "&all=1" : ""}#run`;
  return (
    <section data-slot="runs-timeline" aria-label="Other Runs">
      <div className="mt-10 mb-3 flex items-baseline gap-3 border-b-2 border-foreground pb-2">
        <h2 className="font-headline text-[1.875rem] leading-[0.9] uppercase">Other Runs</h2>
        <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">
          {timeline ? lanes.length : "–"}
        </span>
        {lanes.length > 0 && <span className="ml-auto text-sm text-faint-foreground">Tap a Run to open it</span>}
      </div>
      {!timeline ? (
        <p className="text-dim-foreground">The other Runs couldn&apos;t be read just now.</p>
      ) : lanes.length === 0 ? (
        <p className="text-dim-foreground">Nobody else has a Run yet.</p>
      ) : (
        <>
          <div aria-hidden className={`${LANE_GRID} mb-1.5`}>
            <span className="font-label text-[0.72rem] tracking-[0.08em] text-faint-foreground max-sm:invisible">
              On one timeline
            </span>
            <span className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {timeline.labels.map((label) => (
                <span
                  key={label.year}
                  style={{ gridColumnStart: label.index + 1 }}
                  className={`font-label row-start-1 text-[0.68rem] tracking-[0.04em] whitespace-nowrap text-faint-foreground sm:text-[0.72rem] ${label.year % 10 ? "max-sm:invisible" : ""}`}
                >
                  {label.year}
                </span>
              ))}
            </span>
          </div>
          <div className="flex flex-col">
            {shown.map((lane) => (
              <TimelineLaneRow key={lane.runId} lane={lane} href={href(lane.userId)} selected={lane.userId === selected} />
            ))}
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.84rem] text-faint-foreground">
            <Key className="bg-foreground">Cleared</Key>
            <Key className="shadow-[inset_0_0_0_1.5px_var(--color-border-strong)]">Open year</Key>
            <Key className="outline-2 outline-(--challenge-tint-hi) outline-solid">{birthYear ? "Birth year" : "First year"}</Key>
            {lanes.length > SHOWN && (
              <Link
                href={`/challenges/${challengeId}?${new URLSearchParams({
                  ...(selected ? { run: selected } : {}),
                  ...(showAll ? {} : { all: "1" }),
                })}`}
                scroll={false}
                className="ml-auto text-foreground underline decoration-2 decoration-gotm underline-offset-4 hover:text-highlight"
              >
                {showAll ? "Show fewer" : `Show all ${lanes.length} Runs`}
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Key({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i aria-hidden className={`inline-block size-3.5 rounded-[1.5px] ${className}`} />
      {children}
    </span>
  );
}
