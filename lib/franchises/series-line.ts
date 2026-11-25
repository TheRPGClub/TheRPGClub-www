// The Series Line (spec api#487, pick page-line.html): the Franchise page's
// Games view drawn as a rail. Mainline games are numbered stations on a
// paper rail that wraps to the next line; Spin-offs ride a thinner branch;
// Add-ons hang off their parent as yellow stops. Client-safe.

// How many Mainline stations fit on a row, by the width of the view (its
// container query step). Below the first step the line runs down the page.
export const LINE_WIDTHS = [
  { at: "xl", cols: 4 },
  { at: "3xl", cols: 6 },
  { at: "5xl", cols: 8 },
] as const;

// Whether the station at `index` (of `total`) ends a row of `cols` with the
// line running on to the next row, or starts a row the line came down to.
export function lineBreaks(index: number, total: number, cols: number): { end: boolean; start: boolean } {
  return {
    end: (index + 1) % cols === 0 && index < total - 1,
    start: index > 0 && index % cols === 0,
  };
}

// Add-ons a stop names before the rest fold into "N more": up to three, or
// all four when folding would hide only one.
export const ADD_ONS_NAMED = 3;

export function addOnsShown(count: number, open = false): number {
  if (open || count <= ADD_ONS_NAMED + 1) return count;
  return ADD_ONS_NAMED;
}
