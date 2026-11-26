"use client";

import { useEffect, useRef } from "react";
import { NEWS_MARK_PATH, shouldSendMark, type NewsMarkBeacon as Body } from "@/lib/news-mark";

// Moves the member's News Mark to the newest News Item the page showed when
// they leave the News page or hide the tab (ticket www#222), so the items
// stay new for the whole visit. A beacon to the website's route handler,
// which carries the session to the API. A failed beacon leaves the mark
// where it was and says nothing; one the browser refuses is tried again on
// the next leave.
//
// A reload is not a leave, but the browser can't say which one is coming:
// a keyboard reload and a scripted one (the Navigation API) are skipped,
// the reload button is not (decisions log, www#222).

// A pending send from an unmount, cancelled when the beacon mounts again at
// once (React's Strict Mode remount in development).
let unmountSend: number | undefined;

export function NewsMarkBeacon({ newest, mark }: { newest: string | null; mark: string | null }) {
  const latest = useRef({ newest, mark });
  useEffect(() => {
    latest.current = { newest, mark };
  }, [newest, mark]);

  useEffect(() => {
    window.clearTimeout(unmountSend);
    let sent: string | null = null;
    let reloading = false;
    const send = () => {
      const { newest, mark } = latest.current;
      if (reloading || !shouldSendMark(newest, mark, sent)) return;
      if (post({ news_mark: newest })) sent = newest;
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") send();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "F5" && !((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")) return;
      reloading = true;
      // A reload unloads the page at once; still here means it didn't.
      window.setTimeout(() => (reloading = false), 1500);
    };
    const onNavigate = (e: Event) => {
      if ((e as Event & { navigationType?: string }).navigationType === "reload") reloading = true;
    };
    const onShow = () => {
      if (document.visibilityState === "visible") reloading = false;
    };
    const nav = (window as Window & { navigation?: EventTarget }).navigation;
    document.addEventListener("visibilitychange", onHide);
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("pagehide", send);
    window.addEventListener("keydown", onKey);
    nav?.addEventListener("navigate", onNavigate);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("pagehide", send);
      window.removeEventListener("keydown", onKey);
      nav?.removeEventListener("navigate", onNavigate);
      // Leaving /news inside the app (no pagehide) is a leave too.
      unmountSend = window.setTimeout(send, 0);
    };
  }, []);

  return null;
}

// Queues the beacon; false when the browser refused it. Falls back to a
// keepalive fetch where sendBeacon is missing.
function post(body: Body): boolean {
  const json = JSON.stringify(body);
  try {
    if (typeof navigator.sendBeacon === "function") {
      return navigator.sendBeacon(NEWS_MARK_PATH, new Blob([json], { type: "application/json" }));
    }
    void fetch(NEWS_MARK_PATH, {
      method: "POST",
      body: json,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}
