import type { RibbonAccent } from "@/components/corner-ribbon";
import type { VotingCategory } from "@/lib/api/types";

// Per-category accent classes for the nomination board's cards.
//
// Every visual that carries a hue reads from here, so a card in the NR-GOTM
// column is purple end to end — the ownership marker included, which used to
// be hardcoded to the brand red in both columns.
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
    own: "border-brand-500/40",
    crown: "text-brand-300 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]",
    pill: "bg-brand-500/15 text-brand-300 ring-1 ring-inset ring-brand-500/30",
    // Washes the text side of a card the way the dashboard's GOTM cards do,
    // so the hue survives even when the key art is doing the talking.
    glow: "from-brand-950/40 to-transparent",
    hoverBorder: "hover:border-brand-500/40",
    ribbon: "brand" as RibbonAccent,
  },
  purple: {
    count: "text-purple-200/90",
    bar: "bg-linear-to-r from-purple-400 to-purple-700",
    voted: "border-purple-500/50 bg-purple-500/15 text-purple-300",
    card: "border-purple-500/40 bg-purple-500/5",
    winner: "border-purple-500/50",
    own: "border-purple-500/40",
    crown: "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]",
    pill: "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30",
    glow: "from-purple-950/40 to-transparent",
    hoverBorder: "hover:border-purple-500/40",
    ribbon: "purple" as RibbonAccent,
  },
} as const;

export type VotingAccent = keyof typeof accentClasses;

// The club's two categories each own a hue, everywhere they appear.
export const accentForCategory: Record<VotingCategory, VotingAccent> = {
  gotm: "brand",
  nr_gotm: "purple",
};
export type AccentStyle = (typeof accentClasses)[VotingAccent];

// Slides a tally bar to its new relative scale when a vote lands. Overrides
// the Progress indicator's default `transition-all`, which would also try to
// animate the gradient.
export const BAR_MOTION =
  "transition-[width] duration-500 ease-out motion-reduce:transition-none";
