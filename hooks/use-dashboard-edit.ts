"use client";

import { useRef, useState } from "react";
import { markDashboardPanelsSeenAction, saveDashboardPanelsAction } from "@/app/actions/dashboard-panels";
import type { PanelKey } from "@/lib/dashboard/panels";
import { withUndrawn, type PanelChange } from "@/lib/dashboard/panel-edit";

// Changes that didn't save: what to say, and the list to send again.
export interface PanelSaveFailure {
  // Every change since the last list that saved, oldest first.
  changes: PanelChange[];
  // The newest list, with all of them.
  panels: PanelKey[];
}

// The member's panels while they edit them (spec api#421, www#145). Changes
// apply at once and save behind, one PUT at a time: changes made while one
// is in flight wait, and the newest list goes next, so the API never gets
// two lists racing. A save that fails puts back the last list that saved and
// reports every change it undid; Try again sends the newest list again.
//
// `apiList` is the API's list as read, so keys this page doesn't draw keep
// their place on every save (withUndrawn).
export function useDashboardEdit(saved: readonly PanelKey[], apiList: readonly string[], customised: boolean) {
  const [shown, setShown] = useState<PanelKey[]>([...saved]);
  const [failure, setFailure] = useState<PanelSaveFailure | null>(null);
  const [editing, setEditing] = useState(false);
  const [mine, setMine] = useState(customised);
  // The page's own list wins from here on: the server only renders it again
  // after this member's saves (or a Retry), and a Reset happens on /settings,
  // so coming back mounts the dashboard afresh.

  const drawn = useRef<readonly PanelKey[]>([...saved]);
  const confirmed = useRef<PanelKey[]>([...saved]);
  const latest = useRef<PanelKey[]>([...saved]);
  // The changes in `latest` the API hasn't confirmed yet, oldest first.
  const unsaved = useRef<PanelChange[]>([]);
  // A panel switched on since the last PUT went: the next one asks for the
  // dashboard again, to draw its items.
  const rerender = useRef(false);
  const inFlight = useRef(false);
  const seen = useRef(false);

  async function flush() {
    inFlight.current = true;
    for (;;) {
      const sending = latest.current;
      const count = unsaved.current.length;
      const again = rerender.current;
      rerender.current = false;
      const list = withUndrawn(sending, apiList, drawn.current);
      const ok = await saveDashboardPanelsAction(list, again).then(
        (result) => result.ok,
        () => false,
      );
      if (!ok) {
        // Everything since the last save goes back, queued changes included,
        // and the notice, the ring and Try again all speak of that.
        if (unsaved.current.length > 0) setFailure({ changes: unsaved.current, panels: latest.current });
        latest.current = confirmed.current;
        unsaved.current = [];
        rerender.current = false;
        setShown(confirmed.current);
        break;
      }
      confirmed.current = sending;
      unsaved.current = unsaved.current.slice(count);
      setMine(true);
      if (latest.current === sending) break;
    }
    inFlight.current = false;
  }

  function push(next: PanelKey[], changes: readonly PanelChange[]) {
    latest.current = next;
    unsaved.current = [...unsaved.current, ...changes];
    if (changes.some((c) => c.kind === "show")) rerender.current = true;
    setShown(next);
    setFailure(null);
    if (!inFlight.current) void flush();
  }

  function apply(next: PanelKey[] | null, change: PanelChange) {
    if (next) push(next, [change]);
  }

  // Opening edit mode marks the panels it shows (the dashboard's
  // and the tray's) seen, so the API's `new` clears for those only; the
  // "New" stamps stay up for the rest of this visit.
  function open(drawnInEdit: readonly PanelKey[]) {
    setEditing(true);
    if (seen.current) return;
    seen.current = true;
    markDashboardPanelsSeenAction([...drawnInEdit]).catch(() => {});
  }

  return {
    shown,
    editing,
    open,
    close: () => setEditing(false),
    apply,
    failure,
    dismiss: () => setFailure(null),
    retry: () => failure && push(failure.panels, failure.changes),
    // The member has their own list (saved before, or in this visit).
    customised: mine,
  };
}
