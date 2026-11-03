"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// True once in the browser. Local times depend on the viewer's zone, which
// the server doesn't know, so they render only after hydration.
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
