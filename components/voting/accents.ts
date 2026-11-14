import type { RibbonAccent } from "@/components/corner-ribbon";
import type { VotingCategory } from "@/lib/api/types";

// Per-category accent classes for the voting surfaces.
//
// Every visual that carries a hue reads from here, so a card in the NR-GOTM
// column is violet end to end. The keys keep their old names (brand, purple)
// so callers don't churn; the values are the Monthly Issue track inks: flat
// GOTM red and NR-GOTM violet, no glows.
export const accentClasses = {
  brand: {
    count: "text-foreground",
    bar: "bg-gotm",
    voted: "border-gotm bg-gotm text-gotm-foreground",
    card: "border-gotm/50 bg-card",
    winner: "border-gotm",
    own: "border-highlight",
    crown: "text-gotm-soft",
    pill: "bg-gotm text-gotm-foreground",
    glow: "from-card to-transparent",
    hoverBorder: "hover:border-gotm/60",
    ribbon: "brand" as RibbonAccent,
  },
  purple: {
    count: "text-foreground",
    bar: "bg-nr",
    voted: "border-nr bg-nr text-nr-foreground",
    card: "border-nr/50 bg-card",
    winner: "border-nr",
    own: "border-highlight",
    crown: "text-nr-soft",
    pill: "bg-nr text-nr-foreground",
    glow: "from-card to-transparent",
    hoverBorder: "hover:border-nr/60",
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
// the Progress indicator's default `transition-all`.
export const BAR_MOTION =
  "transition-[width] duration-500 ease-out motion-reduce:transition-none";
