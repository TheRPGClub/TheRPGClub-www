"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import {
  rulerPct,
  rulerRows,
  rulerTime,
  shiftDays,
  snapToDay,
  type RulerScale,
  type RulerTick,
} from "@/lib/voting-console";
import { cn } from "@/lib/utils";
import { GhostMark, PinMark, TickMark } from "./ruler-marks";

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

  // A move past either limit leaves the pin where it is, so it never lands
  // on an odd clock time at the edge.
  const move = (at: number) => {
    if (pin && at >= pin.min && at <= pin.max) pin.onChange(at);
  };

  // A drag lands on the day under the pointer, at the pin's clock time; a
  // day that would put it before `min` rolls forward a day; past `max` it
  // stays put.
  const moveTo = (clientX: number) => {
    if (!pin || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    let at = snapToDay(rulerTime(pct, scale), pin.at);
    if (at < pin.min) at = shiftDays(at, 1);
    move(at);
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
    move(shiftDays(pin.at, days));
  };

  const todayPct = rulerPct(now, scale);
  const pinPct = pin ? rulerPct(pin.at, scale) : null;

  return (
    <div
      ref={ref}
      className={cn("relative select-none", lower || pin ? "h-[92px]" : "h-[64px]", className)}
    >
      <div aria-hidden className="absolute inset-x-0 top-10 h-0.5 bg-border-strong" />
      <div aria-hidden className="absolute left-0 top-10 h-0.5 bg-foreground" style={{ width: `${todayPct}%` }} />

      {all.map((tick) =>
        // Clamped to the ruler: a tick before its start sits at the edge.
        tick.tone === "pin" ? null : (
          <TickMark key={tick.key} tick={tick} pct={rulerPct(tick.at, scale)} row={rows.get(tick.key) ?? 0} />
        ),
      )}

      {pin && pinPct !== null && <PinMark pin={pin} pct={pinPct} handlers={{ onPointerDown, onPointerMove, onKeyDown }} />}

      {!pin && ghost && <GhostMark ghost={ghost} />}
    </div>
  );
}
