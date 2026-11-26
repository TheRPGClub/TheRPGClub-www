import type { RoadmapItem } from "./types";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

// What saving the item dialog came to: an error to show (null once saved),
// and the item as the API now has it (null while nothing was created). The
// dialog edits that item from then on, so a retry never creates it twice.
export type ItemSave = { error: string | null; item: RoadmapItem | null };

// Saves an item dialog in up to two requests: create or update its fields,
// then mark it Shipped or not when that differs. When the second fails after
// a create, the answer still carries the created item.
export async function saveItemSteps(
  item: RoadmapItem | null,
  shipped: boolean,
  write: (item: RoadmapItem | null) => Promise<Result<RoadmapItem>>,
  ship: (id: number, shipped: boolean) => Promise<Result<RoadmapItem>>,
): Promise<ItemSave> {
  const saved = await write(item);
  if (!saved.ok) return { error: saved.error, item };
  if (shipped === (saved.data.shipped_at !== null)) return { error: null, item: saved.data };
  const marked = await ship(saved.data.id, shipped);
  return marked.ok ? { error: null, item: marked.data } : { error: marked.error, item: saved.data };
}
