"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// `leaving` when the browser's Back button was pressed.
export const LEAVING_BACK = "history:back";

// Marks the guard's sentinel history entry.
const SENTINEL = "leaveGuard";
const onSentinel = () => (window.history.state as Record<string, unknown> | null)?.[SENTINEL] === true;

// The state to pass to history.replaceState for an in-page URL change (the
// Game Edit tab), so the sentinel keeps its mark.
export function guardedHistoryState(): Record<string, unknown> | null {
  return onSentinel() ? { [SENTINEL]: true } : null;
}

// Asks before leaving a page with unsaved work (the Game Edit page's staged
// changes): closing or reloading the tab gets the browser's own prompt, and
// an in-app link or the browser's Back is held while `dirty`, its target
// returned as `leaving` (LEAVING_BACK for Back) for the caller's confirm.
// `leave()` goes on to it, `stay()` drops it.
//
// The link is caught on the document in the capture phase, before React's
// own listener at the app root, so next/link never starts the navigation.
// Links that open elsewhere (new tab, download, another site, a modifier
// key) pass through.
//
// Back can't be cancelled, so while dirty the page pushes a sentinel entry
// for the same URL (Next's patched pushState keeps its router state on it).
// Back then only pops the sentinel: the guard pushes it again and asks.
// Pushing truncates the forward history, so Forward has nothing to guard.
// Once clean, the sentinel is popped so Back works in one press again.
export function useLeaveGuard(dirty: boolean) {
  const router = useRouter();
  const [leaving, setLeaving] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  // The URL of a sentinel the guard is popping itself, to keep once popped
  // (the tab may have changed since the entry under it was made).
  const selfPop = useRef<string | null>(null);
  useEffect(() => {
    dirtyRef.current = dirty;
    if (dirty && !onSentinel()) {
      window.history.pushState({ [SENTINEL]: true }, "", window.location.href);
    } else if (!dirty && onSentinel()) {
      selfPop.current = window.location.href;
      window.history.back();
    }
  }, [dirty]);

  useEffect(() => {
    const back = () => {
      const href = selfPop.current;
      if (href !== null) {
        selfPop.current = null;
        if (window.location.href !== href) window.history.replaceState(null, "", href);
        return;
      }
      if (!dirtyRef.current || onSentinel()) return;
      window.history.pushState({ [SENTINEL]: true }, "", window.location.href);
      setLeaving(LEAVING_BACK);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    const hold = (e: MouseEvent) => {
      if (!dirtyRef.current || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaving(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", hold, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", hold, true);
    };
  }, []);

  return {
    leaving,
    leave: () => {
      const to = leaving;
      dirtyRef.current = false;
      setLeaving(null);
      // Past the sentinel and the page's own entry.
      if (to === LEAVING_BACK) window.history.go(-2);
      else if (to) router.push(to);
    },
    stay: () => setLeaving(null),
  };
}
