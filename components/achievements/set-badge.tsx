import { CircleCheck, Crown, Trophy } from "lucide-react";
import { type SetBadge, HIGHLIGHT_LABEL } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { TIER_RING } from "./achievement-icon";

// A set's earned badge. Mastery (all hardcore) is the paper chip, the
// loudest neutral; a Platinum is ringed in its metal; a Completion is the
// plain chip. None borrows a spot ink.
const STYLE: Record<SetBadge, string> = {
  completion: "bg-paper/8 text-paper",
  mastery: "bg-paper text-ink",
  platinum: "bg-paper/8 text-paper",
};

const ICON = {
  completion: CircleCheck,
  mastery: Crown,
  platinum: Trophy,
} as const;

export function SetBadgeChip({
  badge,
  className,
}: {
  badge: SetBadge;
  className?: string;
}) {
  const Icon = ICON[badge];
  return (
    <span
      className={cn(
        "font-label inline-flex h-6 items-center gap-1 rounded-xs px-2 text-[0.78rem] whitespace-nowrap [&_svg]:size-3",
        STYLE[badge],
        className,
      )}
      style={
        badge === "platinum"
          ? { boxShadow: `inset 0 0 0 1px ${TIER_RING.platinum}` }
          : undefined
      }
    >
      <Icon aria-hidden />
      {HIGHLIGHT_LABEL[badge]}
    </span>
  );
}
