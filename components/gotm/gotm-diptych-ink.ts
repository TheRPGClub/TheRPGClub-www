// A Category's inks on a GOTM History diptych leaf, and how a leaf's
// headline breaks.

export const INK = {
  gotm: {
    chip: "bg-gotm text-gotm-foreground",
    emptyChip: "border border-gotm text-gotm-soft",
    foot: "bg-gotm",
    emptyFoot: "bg-[repeating-linear-gradient(90deg,var(--color-gotm)_0_14px,transparent_14px_24px)]",
    second: "text-highlight",
  },
  nr_gotm: {
    chip: "bg-nr text-nr-foreground",
    emptyChip: "border border-nr text-nr-soft",
    foot: "bg-nr",
    emptyFoot: "bg-[repeating-linear-gradient(90deg,var(--color-nr)_0_14px,transparent_14px_24px)]",
    second: "text-nr-soft",
  },
} as const;

// A headline breaks only at its subtitle colon; a plain title stays whole.
export function headline(title: string): [string, string | null] {
  const colon = title.indexOf(":");
  if (colon > 0 && colon < title.length - 1) {
    return [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  }
  return [title, null];
}
