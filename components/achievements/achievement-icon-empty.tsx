import { Lock } from "lucide-react";
import { stableTilt } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import type { SizeSpec } from "./achievement-icon-sizes";

// The tiles of an Achievement the shown member hasn't unlocked: sealed (a
// spoiler) or the empty, dashed slot.

export function SealedTile({
  id,
  s,
  tint,
}: {
  id: number;
  s: SizeSpec;
  tint?: string;
}) {
  return (
    <span
      data-slot="achievement-icon-face"
      className={cn(
        "absolute grid place-items-center overflow-hidden border border-border-strong bg-muted",
        s.inset,
      )}
      style={{ "--tilt": `${stableTilt(id)}deg` } as React.CSSProperties}
    >
      <span
        aria-hidden
        data-slot="achievement-icon-seal"
        className="absolute h-[22%] w-[200%] -rotate-45 bg-border-strong"
        style={tint ? { background: tint } : undefined}
      />
      <span
        aria-hidden
        data-slot="achievement-icon-mark"
        className={cn("font-headline relative leading-none text-foreground", s.mark)}
      >
        ?
      </span>
      {s.label && (
        <span data-slot="achievement-icon-label" className="font-label absolute bottom-1.5 text-[0.7rem] tracking-[0.14em] text-dim-foreground">
          Hidden
        </span>
      )}
    </span>
  );
}

export function LockedSlot({
  s,
  slot,
  tint,
}: {
  s: SizeSpec;
  slot?: number;
  tint?: string;
}) {
  return (
    <span
      data-slot="achievement-icon-face"
      className={cn(
        "absolute grid place-items-center border-[1.5px] border-dashed border-border-strong",
        s.inset,
      )}
    >
      {slot != null ? (
        <span
          aria-hidden
          data-slot="achievement-icon-mark"
          className={cn(
            "font-headline leading-none text-faint-foreground opacity-60",
            s.mark,
          )}
          style={tint ? { color: tint } : undefined}
        >
          {String(slot).padStart(2, "0")}
        </span>
      ) : (
        <Lock aria-hidden data-slot="achievement-icon-glyph" className={cn("text-faint-foreground", s.glyph)} />
      )}
    </span>
  );
}
