import { cn } from "@/lib/utils";

// The diagonal banner across a card's top-right corner. It started life on the
// game page marking GOTM / NR-GOTM winners; the voting board reuses it to mark
// the viewer's own nomination, so the two places read as the same device.
//
// It only works inside a positioned, `overflow-hidden` container — the banner
// is wider than the corner it crosses and relies on the card clipping it.
const ribbonAccents = {
  brand: "from-brand-500 to-brand-600 text-brand-50 ring-brand-700/40",
  purple: "from-purple-500 to-purple-600 text-purple-50 ring-purple-700/40",
} as const;

export type RibbonAccent = keyof typeof ribbonAccents;

// Two scales, because the band has to cross the corner at a distance
// proportional to the card. `default` suits a hero; `sm` a cover in a grid,
// where the banner sits about 24px in and a hero-sized one would swallow the
// artwork.
//
// The visible span is the diagonal chord, not the band's full width, so a
// longer label steps down in size and tracking rather than clipping.
// `fitsUpTo` is where that step falls at each scale.
const ribbonSizes = {
  default: {
    box: "top-7 -right-14 h-7 w-52",
    // "GOTM Winner" still fits roomy; "NR GOTM Winner" does not.
    fitsUpTo: 12,
    roomy: "text-[10px] tracking-[0.25em]",
    tight: "text-[9px] tracking-[0.15em]",
  },
  sm: {
    box: "top-3 -right-10 h-5 w-32",
    // "GOTM" fits roomy; "NR GOTM" does not.
    fitsUpTo: 5,
    roomy: "text-[9px] tracking-[0.15em]",
    tight: "text-[8px] tracking-[0.05em]",
  },
} as const;

export type RibbonSize = keyof typeof ribbonSizes;

export interface CornerRibbonProps {
  accent: RibbonAccent;
  label: string;
  // Announced to screen readers; defaults to the visible label.
  srLabel?: string;
  size?: RibbonSize;
}

export function CornerRibbon({
  accent,
  label,
  srLabel,
  size = "default",
}: CornerRibbonProps) {
  const scale = ribbonSizes[size];

  return (
    <div
      aria-label={srLabel ?? label}
      className={cn(
        "pointer-events-none absolute z-30 flex rotate-45 items-center justify-center",
        scale.box,
      )}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center whitespace-nowrap bg-linear-to-r font-bold uppercase shadow-md ring-1",
          ribbonAccents[accent],
          label.length <= scale.fitsUpTo ? scale.roomy : scale.tight,
        )}
      >
        {label}
      </div>
    </div>
  );
}
