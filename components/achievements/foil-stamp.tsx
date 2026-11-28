import { HIGHLIGHT_LABEL, type SetBadge } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// A set's Completion, Mastery or Platinum as a foil badge, lettered in the
// display face. Foil is reserved for these three. Its shape, press angle and
// inner edge are the Theme's (`foil-stamp`; the Monthly Issue presses
// it onto the page at -8deg). Position it from the caller (it is
// inline-block).
const SIZE = {
  sm: "px-2 pt-1.5 pb-1 text-base",
  md: "px-3 pt-2 pb-1.5 text-2xl",
  lg: "px-4 pt-2.5 pb-2 text-4xl",
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
      data-slot="foil-stamp"
      data-size={size}
      data-kind={kind}
      className={cn("foil font-headline inline-block leading-none tracking-[0.04em]", SIZE[size], className)}
    >
      {HIGHLIGHT_LABEL[kind]}
    </span>
  );
}
