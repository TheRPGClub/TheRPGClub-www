import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// A News Category's ink as a 16px square, on the News page's rail and the
// settings switches: filled when the category is in the view, an inset
// outline when not. Rumours carries a dashed edge (unconfirmed news).
export function InkSquare({
  color,
  dashed,
  filled = true,
  className,
}: {
  // From newsInk(key).
  color: string;
  dashed: boolean;
  filled?: boolean;
  className?: string;
}) {
  return (
    <i
      aria-hidden
      style={{ "--news-ink": color } as CSSProperties}
      className={cn(
        "size-4 shrink-0 rounded-xs",
        filled ? "bg-(--news-ink)" : "shadow-[inset_0_0_0_1.5px_var(--news-ink)]",
        dashed &&
          (filled
            ? "outline-[1.5px] -outline-offset-[2px] outline-background/70 outline-dashed"
            : "border-[1.5px] border-dashed border-(--news-ink) shadow-none"),
        className,
      )}
    />
  );
}
