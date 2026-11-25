// The pure half of the site's one reorder pattern, Make Room (pick B,
// 2026-11-25): items live in one or more zones (a list's order, or a
// Franchise's Mainline / Spin-offs / Add-ons); dragging one moves it live
// and the others slide aside around its gap. These helpers work out where
// it goes; hooks/use-sortable.ts drives the pointer and the keyboard.
// Client-safe.

export type SortId = string | number;
export type SortZones<Z extends string, Id extends SortId> = Record<Z, Id[]>;
export type SortLayout = "grid" | "rows";

export interface SortRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

// The zone holding `id`, or null.
export function zoneOf<Z extends string, Id extends SortId>(zones: SortZones<Z, Id>, id: Id): Z | null {
  for (const z of Object.keys(zones) as Z[]) if (zones[z].includes(id)) return z;
  return null;
}

// `zones` with `id` taken out of wherever it is and put at `index` in `to`
// (clamped). The same object back when nothing would change.
export function moveTo<Z extends string, Id extends SortId>(
  zones: SortZones<Z, Id>,
  id: Id,
  to: NoInfer<Z>,
  index: number,
): SortZones<Z, Id> {
  const from = zoneOf(zones, id);
  if (from === null || !(to in zones)) return zones;
  const target = zones[to].filter((x) => x !== id);
  const at = Math.max(0, Math.min(index, target.length));
  if (from === to && zones[from].indexOf(id) === at) return zones;
  const next = { ...zones, [from]: zones[from].filter((x) => x !== id) } as SortZones<Z, Id>;
  next[to] = [...target.slice(0, at), id, ...target.slice(at)];
  return next;
}

// Where a point falls among a zone's items (their rects in order, the
// dragged one left out): rows go by each row's middle; a grid reads like
// text, a row at a time, by each cover's middle.
export function insertionIndex(rects: readonly SortRect[], x: number, y: number, layout: SortLayout): number {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (layout === "rows") {
      if (y < (r.top + r.bottom) / 2) return i;
    } else {
      if (y < r.top) return i;
      if (y <= r.bottom && x < (r.left + r.right) / 2) return i;
    }
  }
  return rects.length;
}

// One keyboard step (-1 earlier, 1 later): within its zone, then over the
// edge into the zone before or after (in `order`), skipping zones that
// refuse it. Null at either end.
export function stepFrom<Z extends string, Id extends SortId>(
  zones: SortZones<Z, Id>,
  order: readonly Z[],
  id: Id,
  dir: -1 | 1,
  canDrop: (id: Id, to: Z) => boolean = () => true,
): { zone: Z; index: number } | null {
  const from = zoneOf(zones, id);
  if (from === null) return null;
  const i = zones[from].indexOf(id);
  const j = i + dir;
  if (j >= 0 && j < zones[from].length) return { zone: from, index: j };
  for (let z = order.indexOf(from) + dir; z >= 0 && z < order.length; z += dir) {
    const zone = order[z];
    if (!canDrop(id, zone)) continue;
    return { zone, index: dir > 0 ? 0 : zones[zone].length };
  }
  return null;
}

// One keyboard step where a zone's order isn't the member's to set (a
// Franchise's release order, a Pool): straight into the next zone that takes
// it, at its near end. Null when there's none.
export function jumpFrom<Z extends string, Id extends SortId>(
  zones: SortZones<Z, Id>,
  order: readonly Z[],
  id: Id,
  dir: -1 | 1,
  canDrop: (id: Id, to: Z) => boolean = () => true,
): { zone: Z; index: number } | null {
  const from = zoneOf(zones, id);
  if (from === null) return null;
  for (let z = order.indexOf(from) + dir; z >= 0 && z < order.length; z += dir) {
    const zone = order[z];
    if (canDrop(id, zone)) return { zone, index: dir > 0 ? 0 : zones[zone].length };
  }
  return null;
}

// Whether two orders differ.
export function zonesChanged<Z extends string, Id extends SortId>(a: SortZones<Z, Id>, b: SortZones<Z, Id>): boolean {
  return (Object.keys(a) as Z[]).some((z) => a[z].length !== b[z].length || a[z].some((id, i) => id !== b[z][i]));
}
