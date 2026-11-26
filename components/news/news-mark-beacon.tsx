"use client";

import { useEffect } from "react";
import { NEWS_PATH } from "@/lib/news";
import {
  followVisit,
  NEWS_MARK_PATH,
  shouldSendMark,
  type NewsMarkBeacon as Body,
  type VisitBeacon,
} from "@/lib/news-mark";

// Moves the member's News Mark to the newest `listed_at` the unfiltered
// Catch-up showed over the visit when they leave the News page or hide the
// tab (ticket www#222, fix pass). The visit's split is held by the address
// (`?mark=`), so sending on hide never changes what this visit shows. A
// beacon to the website's route handler, which carries the session to the
// API. A failed beacon leaves the mark where it was and says nothing; one
// the browser refuses is tried again on the next leave.
//
// A reload is not a leave, but the browser can't say which one is coming:
// a keyboard reload and a scripted one (the Navigation API) are skipped
// until the page shows again, the reload button is not (decisions log).

// The visit so far, kept across the beacon's unmounts and remounts (Catch-up
// to Shelves and back, a re-render, React's Strict Mode remount), so the
// newest shown only moves forward over the whole visit.
let visit: VisitBeacon | null = null;
let reloading = false;

function send(force = false) {
  if (!visit || (reloading && !force)) return;
  const { newest, mark, sent } = visit;
  if (!shouldSendMark(newest, mark, sent)) return;
  if (post({ news_mark: newest })) visit = { ...visit, sent: newest };
}

export function NewsMarkBeacon({
  mark,
  shown,
}: {
  // The visit's mark (the address's, else the stored one); null on a first
  // visit.
  mark: string | null;
  // The newest `listed_at` this view showed, null for nothing or for a view
  // that may not move the mark (beaconEligible).
  shown: string | null;
}) {
  useEffect(() => {
    visit = followVisit(visit, mark, shown);
  }, [mark, shown]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") send();
      else reloading = false;
    };
    const onPageHide = () => send();
    const onPageShow = () => {
      reloading = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r")) reloading = true;
    };
    const onNavigate = (e: Event) => {
      if ((e as Event & { navigationType?: string }).navigationType === "reload") reloading = true;
    };
    const nav = (window as Window & { navigation?: EventTarget }).navigation;
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("keydown", onKey);
    nav?.addEventListener("navigate", onNavigate);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("keydown", onKey);
      nav?.removeEventListener("navigate", onNavigate);
      // Leaving Catch-up inside the app (no pagehide) is a leave too. Wait
      // for the router to commit the new address: still on /news means a
      // remount (Strict Mode, a re-render), not a leave. Nothing cancels a
      // send once it is due.
      window.setTimeout(() => {
        if (window.location.pathname !== NEWS_PATH) send(true);
      }, 0);
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
