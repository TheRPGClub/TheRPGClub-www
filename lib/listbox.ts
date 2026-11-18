// The keys of a field that opens a list of choices under it (the Club
// Codex's @ mentions and See also search): Escape closes the list, the arrow
// keys move the lit choice round it, and `pickKeys` pick the lit one.
// Returns what the key does, or null when it does nothing here (the field
// keeps the key).

export type ListboxKey = { action: "close" } | { action: "pick"; index: number } | { action: "move"; index: number };

export function listboxKey(key: string, lit: number, count: number, pickKeys: readonly string[]): ListboxKey | null {
  if (key === "Escape") return { action: "close" };
  if (count === 0) return null;
  if (key === "ArrowDown" || key === "ArrowUp") {
    const step = key === "ArrowDown" ? 1 : -1;
    return { action: "move", index: (lit + step + count) % count };
  }
  if (pickKeys.includes(key)) return { action: "pick", index: Math.min(lit, count - 1) };
  return null;
}
