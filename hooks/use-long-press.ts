"use client";

import { useEffect, useRef } from "react";

// About half a second, the platforms' own long press.
const PRESS_MS = 500;
// A finger that drifts further than this is scrolling, not holding.
const SLOP_PX = 10;
const VIBRATE_MS = 15;
// How long after the lift its own events (pointerup, click) still count as
// part of the press.
const LIFT_MS = 400;

function noHover(): boolean {
  return window.matchMedia("(hover: none)").matches;
}

// A long press on a touchscreen (spec api#416, www#136): handlers for the
// element that holds the pressable row. Only on devices without hover;
// mouse and pen presses are left alone. A hold of PRESS_MS without moving
// calls `onPress` with a short vibration where supported, and swallows the
// tap that the lifted finger then makes, so the row doesn't navigate; a
// plain tap still does. The browser's own long-press menu is held back.
// Events bubbling up through React portals (an open menu) are ignored.
export function useLongPress(enabled: boolean, onPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const holding = useRef(false);
  const press = useRef(onPress);
  useEffect(() => {
    press.current = onPress;
  });

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    origin.current = null;
  };
  useEffect(() => cancel, []);
  const lift = () => {
    cancel();
    if (holding.current) setTimeout(() => (holding.current = false), LIFT_MS);
  };
  const held = () => holding.current;

  if (!enabled) return { handlers: {}, held };

  const own = (e: React.SyntheticEvent) => e.currentTarget.contains(e.target as Node);

  const handlers = {
    onPointerDown(e: React.PointerEvent) {
      if (!own(e)) return;
      fired.current = false;
      cancel();
      if (e.pointerType === "mouse" || !noHover()) return;
      origin.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        timer.current = null;
        fired.current = true;
        holding.current = true;
        if ("vibrate" in navigator) navigator.vibrate(VIBRATE_MS);
        press.current();
      }, PRESS_MS);
    },
    onPointerMove(e: React.PointerEvent) {
      const at = origin.current;
      if (at && Math.hypot(e.clientX - at.x, e.clientY - at.y) > SLOP_PX) cancel();
    },
    onPointerUp: lift,
    onPointerCancel: lift,
    onContextMenu(e: React.MouseEvent) {
      if (own(e) && noHover()) e.preventDefault();
    },
    onClickCapture(e: React.MouseEvent) {
      if (!own(e) || !fired.current) return;
      fired.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
  };
  return { handlers, held };
}
