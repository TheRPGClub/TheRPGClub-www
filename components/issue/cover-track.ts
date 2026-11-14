// The cover story's shared pieces: each track's inks, the panel scale by
// winner count and the headline's split.

export const TRACK = {
  gotm: {
    label: "Game of the Month",
    number: "text-gotm",
    accent: "text-highlight",
    tag: "bg-gotm text-gotm-foreground",
    button: "default",
  },
  nr_gotm: {
    label: "Non-RPG Game of the Month",
    number: "text-nr",
    accent: "text-nr-soft",
    tag: "bg-nr text-nr-foreground",
    button: "nr",
  },
} as const;

// Panel scale by winner count: the lead's size, then each co-winner's.
export type PanelSize = "xl" | "l" | "m" | "s";
export const SIZES: Record<number, PanelSize[]> = {
  1: ["xl"],
  2: ["l", "m"],
  3: ["l", "s", "s"],
};

export const TITLE_SIZE: Record<PanelSize, string> = {
  xl: "text-6xl sm:text-7xl lg:text-[5.75rem]",
  l: "text-5xl lg:text-6xl",
  m: "text-4xl lg:text-[2.875rem]",
  s: "text-3xl lg:text-[2.125rem]",
};

// Headlines break at the subtitle colon ("Metaphor:" / "ReFantazio") and the
// second line takes the track's accent; a title without one accents its last
// word, and a one-word title accents whole.
export function splitTitle(title: string): [string, string] {
  const colon = title.indexOf(":");
  if (colon > 0 && colon < title.length - 1) {
    return [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  }
  const space = title.lastIndexOf(" ");
  if (space > 0) return [title.slice(0, space), title.slice(space + 1)];
  return ["", title];
}
