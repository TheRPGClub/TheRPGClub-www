// The diagonal banner across a card's top-right corner. It started life on the
// game page marking GOTM / NR-GOTM winners (the starburst does that job
// there now); the voting board reuses it to mark
// the viewer's own nomination, so the two places read as the same device.
//
// It only works inside a positioned, `overflow-hidden` container — the banner
// is wider than the corner it crosses and relies on the card clipping it.
// Each Theme draws it (themes/<name>/primitives.css): the slot carries its
// track as data-tone and its scale as data-size, the band its label's fit.
const ribbonTones = {
  brand: "gotm",
  purple: "nr",
} as const;

export type RibbonAccent = keyof typeof ribbonTones;

// Two scales, because the band has to cross the corner at a distance
// proportional to the card. `default` suits a hero; `sm` a cover in a grid,
// where the banner sits about 24px in and a hero-sized one would swallow the
// artwork.
//
// The visible span is the diagonal chord, not the band's full width, so a
// longer label steps down in size and tracking rather than clipping
// (data-fit "tight"). This is where that step falls at each scale:
// "GOTM Winner" still fits roomy at default and "NR GOTM Winner" does not;
// "GOTM" fits roomy at sm and "NR GOTM" does not.
const fitsUpTo = {
  default: 12,
  sm: 5,
} as const;

export type RibbonSize = keyof typeof fitsUpTo;

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
  return (
    <div
      aria-label={srLabel ?? label}
      data-slot="corner-ribbon"
      data-tone={ribbonTones[accent]}
      data-size={size}
      className="pointer-events-none absolute z-30 flex items-center justify-center"
    >
      <div
        data-slot="corner-ribbon-band"
        data-fit={label.length <= fitsUpTo[size] ? "roomy" : "tight"}
        className="flex h-full w-full items-center justify-center whitespace-nowrap"
      >
        {label}
      </div>
    </div>
  );
}
