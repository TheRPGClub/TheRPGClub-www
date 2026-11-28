import { slotDots } from "@/lib/member-achievements";
import { cn } from "@/lib/utils";

// A set's slots as a strip of dots in the game tint, earned first and the
// rest dashed.
export function SlotDots({
  earned,
  total,
  tint,
  className,
}: {
  earned: number;
  total: number;
  tint: string;
  className?: string;
}) {
  const { filled, empty } = slotDots(earned, total);
  return (
    <span
      aria-hidden
      data-slot="slot-dots"
      className={cn("flex flex-wrap gap-[3px]", className)}
      style={{ "--tint": tint } as React.CSSProperties}
    >
      {Array.from({ length: filled }, (_, i) => (
        <i key={`f${i}`} data-slot="slot-dot" data-on="" className="size-[7px] rounded-full bg-(--tint)" />
      ))}
      {Array.from({ length: empty }, (_, i) => (
        <i
          key={`e${i}`}
          data-slot="slot-dot"
          className="size-[7px] rounded-full border border-dashed border-faint-foreground/70"
        />
      ))}
    </span>
  );
}
