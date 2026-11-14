import { CircleCheck, Crown, Trophy } from "lucide-react";
import { type SetBadge, HIGHLIGHT_LABEL } from "@/lib/achievements";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// A set's earned badge as a flat foil chip with ink type: Completion,
// Mastery (all hardcore) or Platinum. Foil is reserved for these three; use
// FoilStamp where the badge is the page's object rather than a fact.
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
    <Badge tone="foil" className={cn("border-0", className)}>
      <Icon aria-hidden />
      {HIGHLIGHT_LABEL[badge]}
    </Badge>
  );
}
