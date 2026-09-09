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

export interface CornerRibbonProps {
  accent: RibbonAccent;
  label: string;
  // Announced to screen readers; defaults to the visible label.
  srLabel?: string;
}

// The visible band is a fixed width, so a longer label steps down in size and
// tracking rather than wrapping or clipping. 12 characters is where "GOTM
// Winner" still fits at the roomy setting and "NR GOTM Winner" no longer does.
const LABEL_FITS_UP_TO = 12;

export function CornerRibbon({ accent, label, srLabel }: CornerRibbonProps) {
  const roomy = label.length <= LABEL_FITS_UP_TO;

  return (
    <div
      aria-label={srLabel ?? label}
      className="pointer-events-none absolute top-7 -right-14 z-30 flex h-7 w-52 rotate-45 items-center justify-center"
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-center whitespace-nowrap bg-linear-to-r font-bold uppercase shadow-md ring-1",
          ribbonAccents[accent],
          roomy ? "text-[10px] tracking-[0.25em]" : "text-[9px] tracking-[0.15em]",
        )}
      >
        {label}
      </div>
    </div>
  );
}
