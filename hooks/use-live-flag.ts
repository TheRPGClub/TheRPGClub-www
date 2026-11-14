"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A flag that is true while something keeps reporting movement (a slider
 * being dragged), and drops `timeoutMs` after the last report if nothing ever
 * says the movement ended (a pointer released off-window, say).
 */
export function useLiveFlag(timeoutMs: number) {
  const [live, setLive] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const mark = () => {
    setLive(true);
    clear();
    timer.current = setTimeout(() => setLive(false), timeoutMs);
  };

  const settle = () => {
    clear();
    setLive(false);
  };

  useEffect(() => clear, []);

  return { live, mark, settle };
}
