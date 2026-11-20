"use client";

import { useRef, useState } from "react";
import { markDashboardPanelsSeenAction, saveDashboardPanelsAction } from "@/app/actions/dashboard-panels";
import type { PanelKey } from "@/lib/dashboard/panels";
import type { PanelChange } from "@/lib/dashboard/panel-edit";

// A change that didn't save: what to say, and the list to send again.
export interface PanelSaveFailure {
  change: PanelChange;
  panels: PanelKey[];
}

// The member's panels while they edit them (spec api#421, www#145). Changes
// apply at once and save behind, one PUT at a time: a change made while one
// is in flight waits, and the latest list goes next, so the API never gets
// two lists racing. A save that fails puts back the last list that saved and
// reports the change.
export function useDashboardEdit(saved: readonly PanelKey[], customised: boolean) {
  const [shown, setShown] = useState<PanelKey[]>([...saved]);
  const [failure, setFailure] = useState<PanelSaveFailure | null>(null);
  const [editing, setEditing] = useState(false);
  const [mine, setMine] = useState(customised);
  // The page's own list wins from here on: the server only renders it again
  // after this member's saves (or a Retry), and a Reset happens on /settings,
  // so coming back mounts the dashboard afresh.

  const confirmed = useRef<PanelKey[]>([...saved]);
  const latest = useRef<PanelKey[]>([...saved]);
  const lastChange = useRef<PanelChange | null>(null);
  const queued = useRef<{ rerender: boolean } | null>(null);
  const inFlight = useRef(false);
  const seen = useRef(false);

  async function flush(rerender: boolean) {
    inFlight.current = true;
    let next: { rerender: boolean } | null = { rerender };
    while (next) {
      const sending = latest.current;
      const ok = await saveDashboardPanelsAction(sending, next.rerender).then(
        (result) => result.ok,
        () => false,
      );
      if (!ok) {
        latest.current = confirmed.current;
        queued.current = null;
        setShown(confirmed.current);
        if (lastChange.current) setFailure({ change: lastChange.current, panels: sending });
        break;
      }
      confirmed.current = sending;
      setMine(true);
      next = queued.current;
      queued.current = null;
    }
    inFlight.current = false;
  }

  function apply(next: PanelKey[] | null, change: PanelChange) {
    if (!next) return;
    latest.current = next;
    lastChange.current = change;
    setShown(next);
    setFailure(null);
    const rerender = change.kind === "show";
    if (inFlight.current) {
      queued.current = { rerender: rerender || queued.current?.rerender === true };
    } else {
      void flush(rerender);
    }
  }

  // Opening edit mode marks every panel seen (the API's `new` clears); the
  // "New" stamps stay up for the rest of this visit.
  function open() {
    setEditing(true);
    if (seen.current) return;
    seen.current = true;
    markDashboardPanelsSeenAction().catch(() => {});
  }

  return {
    shown,
    editing,
    open,
    close: () => setEditing(false),
    apply,
    failure,
    dismiss: () => setFailure(null),
    retry: () => failure && apply(failure.panels, failure.change),
    // The member has their own list (saved before, or in this visit).
    customised: mine,
  };
}
