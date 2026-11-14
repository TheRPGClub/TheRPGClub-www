import { HIGHLIGHT_LABEL, type SetBadge } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// A set's Completion, Mastery or Platinum as a foil stamp pressed onto the
// page at -8deg, lettered in Anton ink. Foil is reserved for these three.
// Position it from the caller (it is inline-block).
const SIZE = {
  sm: "px-2 pt-1.5 pb-1 text-base outline-offset-[-3px] outline-[1.5px]",
  md: "px-3 pt-2 pb-1.5 text-2xl outline-offset-[-5px] outline-2",
  lg: "px-4 pt-2.5 pb-2 text-4xl outline-offset-[-6px] outline-2",
} as const;

export function FoilStamp({
  kind,
  size = "md",
  className,
}: {
  kind: SetBadge;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "foil font-headline inline-block -rotate-8 rounded-xs leading-none tracking-[0.04em] outline-solid outline-background",
        "shadow-[0_6px_14px_rgb(0_0_0/0.45)]",
        SIZE[size],
        className,
      )}
    >
      {HIGHLIGHT_LABEL[kind]}
    </span>
  );
}
