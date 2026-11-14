// A track's inks on the GOTM history's cover wall: the round number, the
// headline's second line and the co-winners.
export const TRACK = {
  gotm: {
    label: "Game of the Month",
    number: "text-gotm",
    accent: "text-highlight",
    co: "text-gotm-soft",
  },
  nr_gotm: {
    label: "Non-RPG Game of the Month",
    number: "text-nr",
    accent: "text-nr-soft",
    co: "text-nr-soft",
  },
} as const;
