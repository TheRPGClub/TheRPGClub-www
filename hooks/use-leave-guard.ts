"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Asks before leaving a page with unsaved work (the Game Edit page's staged
// changes): closing or reloading the tab gets the browser's own prompt, and
// an in-app link is held while `dirty`, its target returned as `leaving` for
// the caller's confirm. `leave()` goes on to it, `stay()` drops it.
//
// The link is caught on the document in the capture phase, before React's
// own listener at the app root, so next/link never starts the navigation.
// Links that open elsewhere (new tab, download, another site, a modifier
// key) pass through.
export function useLeaveGuard(dirty: boolean) {
  const router = useRouter();
  const [leaving, setLeaving] = useState<string | null>(null);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

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
      if (to) router.push(to);
    },
    stay: () => setLeaving(null),
  };
}
