"use client";

import { useSyncExternalStore } from "react";
import { PANELS, type PanelKey } from "@/lib/dashboard/panels";
import { panelName, panelOrder, panelZones, type PanelZone } from "@/lib/dashboard/panel-edit";
import { useSortable } from "@/hooks/use-sortable";

// Tailwind's `lg`, where the panels stand in two columns (panel-grid).
const COLUMNS = "(min-width: 64rem)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(COLUMNS);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const ZONE_NAME: Record<PanelZone, string> = { all: "the dashboard", wide: "the main column", rail: "the side column" };

// Moving Dashboard Panels in edit mode (www#145, Make Room): the panel
// itself drags, Mouse past 5px, touch press and hold, keyboard Space and
// the arrows. Below `lg` the panels are one list; from `lg`, with both
// columns in use, each panel moves within its own column (lib panelZones).
// `order` is the live order to draw from, the member's one order; `onMove`
// gets the new order on a drop.
export function usePanelSort({
  shown,
  editing,
  onMove,
}: {
  shown: readonly PanelKey[];
  editing: boolean;
  onMove: (next: PanelKey[], key: PanelKey) => void;
}) {
  // The server and hydration draw one column; the real width follows.
  const byColumn = useSyncExternalStore(subscribe, () => window.matchMedia(COLUMNS).matches, () => false);
  const sort = useSortable<PanelZone, PanelKey>({
    zones: panelZones(shown, byColumn),
    layout: { all: byColumn && shown.every((k) => PANELS[k].place === "rail") ? "grid" : "rows" },
    onDrop: (next, move) => onMove(panelOrder(shown, next), move.id),
    canDrop: (key, zone) => zone === "all" || PANELS[key].place === zone,
    disabled: !editing,
    name: panelName,
    zoneName: (zone) => ZONE_NAME[zone],
  });
  return { ...sort, order: panelOrder(shown, sort.zones) };
}

export type PanelSort = ReturnType<typeof usePanelSort>;
