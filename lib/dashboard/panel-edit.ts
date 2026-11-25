import type { FeatureView } from "@/lib/features";
import { PANELS, isPanelKey, type PanelKey, type PanelPlace } from "@/lib/dashboard/panels";

// Edit mode on the dashboard (spec api#421, www#145): the member's shown
// panels in their order and the Hidden tray, and the changes they make. Every
// change is the whole shown list, as `PUT /dashboard_panels` takes it.
// Client-safe: no server imports.

// One entry of the API's catalogue (`GET /dashboard_panels`).
export interface CatalogueEntry {
  key: string;
  new: boolean;
}

// The panels the member can turn on: the catalogue's panels this website
// knows and the member is shown, less the ones already shown, in the club's
// order.
export function hiddenPanels(
  catalogue: readonly CatalogueEntry[],
  shown: readonly PanelKey[],
  features: Pick<FeatureView, "shown">,
): PanelKey[] {
  const out: PanelKey[] = [];
  for (const { key } of catalogue) {
    if (!isPanelKey(key) || shown.includes(key) || out.includes(key)) continue;
    const { feature } = PANELS[key];
    if (feature && !features.shown(feature)) continue;
    out.push(key);
  }
  return out;
}

// The catalogue's panels the API marks new (not yet shown to the member in
// edit mode).
export function newPanels(catalogue: readonly CatalogueEntry[]): PanelKey[] {
  return catalogue.filter((entry) => entry.new && isPanelKey(entry.key)).map((entry) => entry.key as PanelKey);
}

// What the member did, for the "Not saved" notice when it doesn't save.
export type PanelChange =
  | { kind: "move"; key: PanelKey }
  | { kind: "show"; key: PanelKey }
  | { kind: "hide"; key: PanelKey };

// The zones a drag in edit mode moves panels within (useSortable). Below
// `lg`, or with only one column in use, the panels stand in one order: one
// zone, "all". With both columns on screen each panel keeps its column, so
// each column is a zone of its own and a panel moves among its own kind.
export type PanelZone = "all" | PanelPlace;
export type PanelZones = Record<PanelZone, PanelKey[]>;

export function panelZones(keys: readonly PanelKey[], byColumn: boolean): PanelZones {
  const wide = keys.filter((k) => PANELS[k].place === "wide");
  const rail = keys.filter((k) => PANELS[k].place === "rail");
  // Only the zones in use: the hook reads its zones from the object's keys.
  if (byColumn && wide.length > 0 && rail.length > 0) return { wide, rail } as PanelZones;
  return { all: [...keys] } as PanelZones;
}

// The member's one order back from the zones: one zone is the order itself;
// per column, each column's new order fills the places its panels held.
export function panelOrder(keys: readonly PanelKey[], zones: PanelZones): PanelKey[] {
  if (zones.all) return [...zones.all];
  const left = { wide: [...(zones.wide ?? [])], rail: [...(zones.rail ?? [])] };
  return keys.map((k) => left[PANELS[k].place].shift() ?? k);
}

// A switched-on panel joins the end of the dashboard.
export function showPanel(keys: readonly PanelKey[], key: PanelKey): PanelKey[] | null {
  return keys.includes(key) ? null : [...keys, key];
}

export function hidePanel(keys: readonly PanelKey[], key: PanelKey): PanelKey[] | null {
  return keys.includes(key) ? keys.filter((k) => k !== key) : null;
}

// A panel's name told apart from its other version: "Now Playing (Mine)".
export function panelName(key: PanelKey): string {
  const spec = PANELS[key];
  if (!spec.chip) return spec.title;
  return `${spec.title} (${spec.scope === "mine" ? "Mine" : "Club"})`;
}

// What went back when a change didn't save.
export function revertNote(change: PanelChange): string {
  const name = panelName(change.key);
  switch (change.kind) {
    case "move":
      return `${name} went back to where it was.`;
    case "show":
      return `${name} is hidden again.`;
    case "hide":
      return `${name} is back on your dashboard.`;
  }
}

// The list to save: the member's edited panels with the API's keys this page
// doesn't draw put back where they were (spec api#421). The API keeps only
// what it hides from the member, so a panel it shows that this website can't
// draw yet (the API ships first), or one a Feature hides from this session
// only, would otherwise drop off their list for good. Each such key follows
// the nearest drawn panel before it in the API's list that is still shown,
// or leads the list when there is none.
export function withUndrawn(edited: readonly PanelKey[], apiList: readonly string[], drawn: readonly PanelKey[]): string[] {
  const after = new Map<string | null, string[]>();
  let anchor: string | null = null;
  for (const key of apiList) {
    if ((drawn as readonly string[]).includes(key)) {
      if ((edited as readonly string[]).includes(key)) anchor = key;
      continue;
    }
    after.set(anchor, [...(after.get(anchor) ?? []), key]);
  }
  const out = [...(after.get(null) ?? [])];
  for (const key of edited) out.push(key, ...(after.get(key) ?? []));
  return [...new Set(out)];
}

// What went back when changes didn't save: the one change, or how many.
export function revertNotes(changes: readonly PanelChange[]): string {
  if (changes.length === 1) return revertNote(changes[0]);
  return `Your last ${changes.length} changes went back.`;
}
