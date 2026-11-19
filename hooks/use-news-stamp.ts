"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NEWS_STAMP_POLL_SECONDS } from "@/lib/news";

const EVERY_MS = NEWS_STAMP_POLL_SECONDS * 1000;

/**
 * Follows the News Feed Stamp while the page is open and re-reads the feed
 * when it moves on from `rendered`, the stamp the page was drawn with (null
 * when that read failed: the first answer is then taken as the baseline).
 * The feed's cache is keyed on the stamp (lib/api/news.ts), so a plain
 * refresh reads the new items.
 * Asks every NEWS_STAMP_POLL_SECONDS while the tab is shown, and at once on
 * coming back to a tab hidden for longer than that. Client state (a
 * half-typed search) survives each refresh.
 */
export function useNewsStamp(rendered: string | null, enabled: boolean) {
  const router = useRouter();
  const known = useRef(rendered);
  useEffect(() => {
    if (rendered !== null) known.current = rendered;
  }, [rendered]);

  useEffect(() => {
    if (!enabled) return;
    let last = Date.now();
    let busy = false;
    const check = async () => {
      if (busy) return;
      busy = true;
      last = Date.now();
      try {
        const res = await fetch("/api/news/stamp", { cache: "no-store" });
        const stamp = res.ok ? ((await res.json()) as { stamp?: string }).stamp : undefined;
        if (stamp && known.current === null) known.current = stamp;
        else if (stamp && stamp !== known.current) {
          known.current = stamp;
          router.refresh();
        }
      } catch {
        // Offline or mid-deploy: the next tick tries again.
      } finally {
        busy = false;
      }
    };
    const timer = window.setInterval(() => {
      if (!document.hidden) void check();
    }, EVERY_MS);
    const onShow = () => {
      if (!document.hidden && Date.now() - last >= EVERY_MS) void check();
    };
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [enabled, router]);
}
