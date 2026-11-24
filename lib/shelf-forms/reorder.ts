// Reordering the ordered lists (Now Playing, Backlog, Favorites; spec
// api#451). The list pages move an entry by drag or with Earlier / Later;
// the save writes each entry's place as its `sort_order` (1 first). The
// Backlog payload doesn't send `sort_order`, so the save renumbers every
// entry whose place changed rather than swapping stored values.

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

export interface SortOrderPatch {
  entryId: number;
  sortOrder: number;
}

// The `sort_order` writes that store `after` as the list's order, numbered
// from 1. When the stored orders of the list as it was (`before`, with each
// entry's `sort_order`) are already exactly 1..n, only the entries whose
// place changed are written; otherwise (unknown, gaps, nulls) every entry
// is, or an untouched entry could land out of place.
export function sortOrderPatches(
  after: readonly number[],
  before?: readonly { entryId: number; sortOrder: number | null | undefined }[],
): SortOrderPatch[] {
  const tidy =
    before !== undefined &&
    before.length === after.length &&
    before.every((entry, index) => entry.sortOrder === index + 1);
  return after.flatMap((entryId, index) =>
    tidy && before[index].entryId === entryId ? [] : [{ entryId, sortOrder: index + 1 }],
  );
}
