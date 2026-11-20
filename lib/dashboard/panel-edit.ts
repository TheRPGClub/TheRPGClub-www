import type { FeatureView } from "@/lib/features";
import { PANELS, isPanelKey, type PanelKey } from "@/lib/dashboard/panels";

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

// The catalogue's panels the API marks new (added since the member last
// opened edit mode).
export function newPanels(catalogue: readonly CatalogueEntry[]): PanelKey[] {
  return catalogue.filter((entry) => entry.new && isPanelKey(entry.key)).map((entry) => entry.key as PanelKey);
}

// What the member did, for the "Not saved" notice when it doesn't save.
export type PanelChange =
  | { kind: "move"; key: PanelKey }
  | { kind: "show"; key: PanelKey }
  | { kind: "hide"; key: PanelKey };

// `key` one place up (-1) or down (+1); null at its end of the list.
export function movePanel(keys: readonly PanelKey[], key: PanelKey, step: -1 | 1): PanelKey[] | null {
  const at = keys.indexOf(key);
  const to = at + step;
  if (at < 0 || to < 0 || to >= keys.length) return null;
  const next = [...keys];
  [next[at], next[to]] = [next[to], next[at]];
  return next;
}

// `key` dropped before `before` (null: at the end); null when nothing moves.
export function placePanel(keys: readonly PanelKey[], key: PanelKey, before: PanelKey | null): PanelKey[] | null {
  if (!keys.includes(key) || key === before) return null;
  if (before !== null && !keys.includes(before)) return null;
  const rest = keys.filter((k) => k !== key);
  const at = before === null ? rest.length : rest.indexOf(before);
  const next = [...rest.slice(0, at), key, ...rest.slice(at)];
  return next.every((k, i) => k === keys[i]) ? null : next;
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

// "3rd": a panel's place, for the drop line and the screen reader.
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
