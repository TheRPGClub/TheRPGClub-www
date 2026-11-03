"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  dayAndClock,
  rulerPct,
  rulerRows,
  rulerTime,
  shiftDays,
  snapToDay,
  type RulerScale,
  type RulerTick,
} from "@/lib/voting-console";
import { cn } from "@/lib/utils";

// Labels stay this far in from the ruler's ends, so the first and last
// never hang off the page.
const EDGE_PCT = 4;

function labelPct(pct: number): number {
  return Math.min(100 - EDGE_PCT, Math.max(EDGE_PCT, pct));
}

const TONE: Record<RulerTick["tone"], string> = {
  plain: "text-paper-mute [&_b]:text-paper",
  now: "text-gotm-soft [&_b]:text-gotm-soft",
  pin: "text-highlight [&_b]:text-highlight",
};

export interface RulerPin {
  at: number;
  // Earliest and latest the pin may move to.
  min: number;
  max: number;
  onChange: (at: number) => void;
  // The "type a date" link under the pin opens the plain date field.
  onTypeDate: () => void;
}

// The round laid out as a date ruler: nominations opening, the vote, any
// runoff, today in red, and the yellow Next vote pin. The pin drags along
// the ruler in whole days (keeping its clock time), steps with the arrow
// keys (a day; Page Up and Down a week), and the plain date field beside it
// sets it too, so the drag is only a shortcut. With no `pin` a hollow
// marker stands in at the far end. Times are the browser's zone; render
// only on the client.
export function DateRuler({
  scale,
  ticks,
  pin,
  ghost,
  now,
  className,
}: {
  scale: RulerScale;
  ticks: RulerTick[];
  pin: (RulerPin & { label: string; caption: string }) | null;
  ghost?: { label: string; caption: string } | null;
  now: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const all: RulerTick[] = pin
    ? [...ticks, { key: "pin", at: pin.at, label: pin.label, caption: pin.caption, tone: "pin" }]
    : ticks;
  const rows = rulerRows(all, scale);
  const lower = [...rows.values()].includes(1);

  const clamp = (at: number) => (pin ? Math.min(pin.max, Math.max(pin.min, at)) : at);

  // A drag lands on the day under the pointer, at the pin's clock time; a
  // day that would put it before `min` rolls forward a day.
  const moveTo = (clientX: number) => {
    if (!pin || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    let at = snapToDay(rulerTime(pct, scale), pin.at);
    if (at < pin.min) at = shiftDays(at, 1);
    pin.onChange(clamp(at));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!pin) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.focus();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) moveTo(e.clientX);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!pin) return;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 7,
      PageDown: -7,
    };
    const days = step[e.key];
    if (days === undefined) return;
    e.preventDefault();
    const at = shiftDays(pin.at, days);
    pin.onChange(clamp(at < pin.min ? pin.min : at));
  };

  const todayPct = rulerPct(now, scale);
  const pinPct = pin ? rulerPct(pin.at, scale) : null;

  return (
    <div
      ref={ref}
      className={cn("relative select-none", lower || pin ? "h-[92px]" : "h-[64px]", className)}
    >
      <div aria-hidden className="absolute inset-x-0 top-10 h-0.5 bg-rule-strong" />
      <div aria-hidden className="absolute left-0 top-10 h-0.5 bg-paper" style={{ width: `${todayPct}%` }} />

      {all.map((tick) => {
        if (tick.tone === "pin") return null;
        const pct = rulerPct(tick.at, scale);
        const row = rows.get(tick.key) ?? 0;
        return (
          <div key={tick.key}>
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
      })}

      {pin && pinPct !== null && (
        <>
          <p
            aria-hidden
            className={cn(
              "font-label absolute top-0 -translate-x-1/2 text-center text-[0.76rem] leading-tight tracking-[0.06em] whitespace-nowrap",
              TONE.pin,
            )}
            style={{ left: `${labelPct(pinPct)}%` }}
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
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onKeyDown={onKeyDown}
            className="absolute top-[26px] -ml-[15px] grid size-[30px] cursor-ew-resize touch-none place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-highlight/60"
            style={{ left: `${pinPct}%` }}
          >
            <span className="size-3.5 rounded-full bg-highlight shadow-[0_0_0_4px_rgb(255_212_0/0.2)]" />
          </div>
          <p
            id="next-vote-help"
            className="absolute top-[60px] -translate-x-1/2 text-[0.8rem] whitespace-nowrap text-paper-dim"
            style={{ left: `${labelPct(pinPct)}%` }}
          >
            Drag, or{" "}
            <button
              type="button"
              onClick={pin.onTypeDate}
              className="underline decoration-gotm underline-offset-3 hover:text-highlight"
            >
              type a date
            </button>
          </p>
        </>
      )}

      {!pin && ghost && (
        <>
          <p
            className="font-label absolute top-0 -translate-x-1/2 text-center text-[0.76rem] leading-tight tracking-[0.06em] whitespace-nowrap text-paper-mute"
            style={{ left: `${100 - EDGE_PCT}%` }}
          >
            <b className="block text-[0.84rem] text-paper-dim">{ghost.label}</b>
            {ghost.caption}
          </p>
          <span
            aria-hidden
            className="absolute top-[34px] -ml-[7px] size-3.5 rounded-full border-2 border-dashed border-paper-mute bg-ink"
            style={{ left: `${100 - EDGE_PCT}%` }}
          />
        </>
      )}
    </div>
  );
}
