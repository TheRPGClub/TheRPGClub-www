"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * While something on the page is still working, re-read the page every
 * `everyMs` so it moves on without a manual reload. Each refresh re-renders
 * the whole page, so ticks are skipped while the tab is hidden and stop after
 * `forMs`; a long job shows its result on the next reload.
 */
export function usePendingRefresh(pending: boolean, everyMs: number, forMs: number) {
  const router = useRouter();

  useEffect(() => {
    if (!pending) return;
    const stopAt = Date.now() + forMs;
    const timer = window.setInterval(() => {
      if (Date.now() >= stopAt) {
        window.clearInterval(timer);
        return;
      }
      if (!document.hidden) router.refresh();
    }, everyMs);
    return () => window.clearInterval(timer);
  }, [pending, everyMs, forMs, router]);
}
