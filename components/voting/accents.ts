// Per-category accent classes, shared by the nomination board's compact rows
// and the showcase card for the viewer's own nomination.
//
// Text sits a step apart from fills (brand-300 vs purple-400) because the two
// palettes diverge in lightness there — brand-300 is oklch L 0.675 and
// purple-400 L 0.714, so they carry equal weight; purple-300 (L 0.827) would
// read noticeably brighter than its red counterpart.
export const accentClasses = {
  brand: {
    count: "text-brand-200/90",
    bar: "bg-linear-to-r from-brand-300 to-brand-700",
    voted: "border-brand-500/50 bg-brand-500/15 text-brand-300",
    card: "border-brand-500/40 bg-brand-500/5",
    winner: "border-brand-500/50",
    crown: "text-brand-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]",
  },
  purple: {
    count: "text-purple-200/90",
    bar: "bg-linear-to-r from-purple-400 to-purple-700",
    voted: "border-purple-500/50 bg-purple-500/15 text-purple-300",
    card: "border-purple-500/40 bg-purple-500/5",
    winner: "border-purple-500/50",
    crown: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
  },
} as const;

export type VotingAccent = keyof typeof accentClasses;
export type AccentStyle = (typeof accentClasses)[VotingAccent];

// Slides a tally bar to its new relative scale when a vote lands. Overrides
// the Progress indicator's default `transition-all`, which would also try to
// animate the gradient.
export const BAR_MOTION =
  "transition-[width] duration-500 ease-out motion-reduce:transition-none";
