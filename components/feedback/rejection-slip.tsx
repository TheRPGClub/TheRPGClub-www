import type { CSSProperties, ReactNode } from "react";

// A paper slip taped to a closed card: a Rejected one's reason (signed by
// the reviewer) or a Duplicate's "Duplicate of" its original. Tilted a
// little and stable per card.
export function ClosedSlip({
  heading,
  signedBy,
  children,
  tilt,
}: {
  heading: string;
  signedBy?: string | null;
  children: ReactNode;
  tilt: number;
}) {
  return (
    <div
      style={{ "--slip": `${tilt}deg` } as CSSProperties}
      data-slot="closed-slip"
      className="relative mx-4 mt-1 ml-8 rounded-xs bg-foreground px-3.5 pt-2.5 pb-3 text-background shadow-[0_6px_14px_rgb(0_0_0/0.45)]"
    >
      <p data-slot="closed-slip-heading" className="font-label flex justify-between gap-3 text-[0.74rem] font-extrabold text-phase-rejected-deep">
        {heading}
        {signedBy && <span className="font-bold text-slip-muted-foreground">{signedBy}</span>}
      </p>
      <div className="mt-0.5 text-[0.95rem] leading-snug break-words whitespace-pre-line italic">
        {children}
      </div>
    </div>
  );
}

// A stable slip tilt within ±1.4deg from the card's id.
export function slipTilt(id: number): number {
  const steps = [1.4, -1, 0.8, -1.2, 1, -0.8, 1.2, -1.4];
  return steps[Math.abs(id + 3) % steps.length];
}
