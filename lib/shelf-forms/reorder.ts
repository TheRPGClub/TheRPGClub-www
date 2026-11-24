// Reordering the ordered lists (Now Playing, Backlog, Favorites; spec
// api#451). The list pages move an entry by drag or with Earlier / Later;
// the save sends the entry's new place as one `position` (api#452b) and the
// API renumbers the rest.

export const ORDERED_KINDS = ["now_playing", "backlog", "favorite"] as const;

// The list with the item at `from` moved to `to` (both clamped).
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  if (from < 0 || from >= next.length) return next;
  const target = Math.max(0, Math.min(next.length - 1, to));
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return next;
}

// One step Earlier (-1) or Later (+1); null at the end it can't pass.
export function nudge<T>(items: readonly T[], index: number, step: -1 | 1): T[] | null {
  const target = index + step;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return null;
  return moveItem(items, index, target);
}
