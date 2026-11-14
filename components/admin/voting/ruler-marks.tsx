import type { KeyboardEvent, PointerEvent } from "react";
import { dayAndClock, type RulerTick } from "@/lib/voting-console";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Labels stay this far in from the ruler's ends, so the first and last
// never hang off the page.
export const EDGE_PCT = 4;

export function labelPct(pct: number): number {
  return Math.min(100 - EDGE_PCT, Math.max(EDGE_PCT, pct));
}

const TONE: Record<RulerTick["tone"], string> = {
  plain: "text-faint-foreground [&_b]:text-foreground",
  now: "text-gotm-soft [&_b]:text-gotm-soft",
  pin: "text-highlight [&_b]:text-highlight",
};

// A point on the ruler: its tick, and its date and caption above the rule
// (row 0) or under it (row 1, when it would print over its neighbour).
export function TickMark({ tick, pct, row }: { tick: RulerTick; pct: number; row: 0 | 1 }) {
  return (
    <div>
      <span
        aria-hidden
        className={cn("absolute top-[34px] h-3.5 w-0.5 -translate-x-1/2 bg-current", TONE[tick.tone])}
        style={{ left: `${pct}%` }}
      />
      <p
        className={cn(
          "font-label absolute -translate-x-1/2 text-center text-[0.76rem] leading-tight tracking-[0.06em] whitespace-nowrap",
          row === 0 ? "top-0" : "top-[52px]",
          TONE[tick.tone],
        )}
        style={{ left: `${labelPct(pct)}%` }}
      >
        <b className="block text-[0.84rem]">{tick.label}</b>
        {tick.caption}
      </p>
    </div>
  );
}

// The yellow Next vote pin: its label, the slider knob and the help under
// it with the "type a date" way round the drag. The knob stays a hand-made
// slider: it rides the ruler's own scale (not its min..max) and snaps to
// whole days at its clock time, which the Slider primitive's track and
// steps can't express; the date field is its plain alternative.
export function PinMark({
  pin,
  pct,
  handlers,
}: {
  pin: { at: number; min: number; max: number; label: string; caption: string; onTypeDate: () => void };
  pct: number;
  handlers: {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  };
}) {
  return (
    <>
      <p
        aria-hidden
        className={cn(
          "font-label absolute top-0 -translate-x-1/2 text-center text-[0.76rem] leading-tight tracking-[0.06em] whitespace-nowrap",
          TONE.pin,
        )}
        style={{ left: `${labelPct(pct)}%` }}
      >
        <b className="block text-[0.84rem]">{pin.label}</b>
        {pin.caption}
      </p>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Next vote opens"
        aria-valuemin={pin.min}
        aria-valuemax={pin.max}
        aria-valuenow={pin.at}
        aria-valuetext={dayAndClock(pin.at)}
        aria-describedby="next-vote-help"
        {...handlers}
        className="absolute top-[26px] -ml-[15px] grid size-[30px] cursor-ew-resize touch-none place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-highlight/60"
        style={{ left: `${pct}%` }}
      >
        <span className="size-3.5 rounded-full bg-highlight shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-highlight)_20%,transparent)]" />
      </div>
      <p
        id="next-vote-help"
        className="absolute top-[60px] -translate-x-1/2 text-[0.8rem] whitespace-nowrap text-dim-foreground"
        style={{ left: `${labelPct(pct)}%` }}
      >
        Drag, or{" "}
        <Button type="button" variant="inline-link" size="inline" onClick={pin.onTypeDate}>
          type a date
        </Button>
      </p>
    </>
  );
}

// With no pin to move, a hollow marker stands in at the ruler's far end.
export function GhostMark({ ghost }: { ghost: { label: string; caption: string } }) {
  return (
    <>
      <p
        className="font-label absolute top-0 -translate-x-1/2 text-center text-[0.76rem] leading-tight tracking-[0.06em] whitespace-nowrap text-faint-foreground"
        style={{ left: `${100 - EDGE_PCT}%` }}
      >
        <b className="block text-[0.84rem] text-dim-foreground">{ghost.label}</b>
        {ghost.caption}
      </p>
      <span
        aria-hidden
        className="absolute top-[34px] -ml-[7px] size-3.5 rounded-full border-2 border-dashed border-faint-foreground bg-background"
        style={{ left: `${100 - EDGE_PCT}%` }}
      />
    </>
  );
}
