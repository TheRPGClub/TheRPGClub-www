import type { AchievementFeedGroup } from "@/lib/api/types";
import { leadHighlight } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { HighlightGroupCard } from "./highlight-group-card";
import { PlainGroupCard } from "./plain-group-card";

// A Latest card: one member's Unlocks in one Achievement Set on one UTC day,
// on a game-tint spine. The icons fan out like a hand of cards. A card that
// holds a Highlight takes double size: its lead Unlock sits large on the
// right under a foil stamp (Platinum, Mastery, Completion) or its
// ultra-rare Rarity, and the rest shrink to a strip of Rarity dots.

export function HubGroupCard({
  card,
  tint,
  className,
}: {
  card: AchievementFeedGroup;
  tint: SetTint;
  className?: string;
}) {
  const lead = leadHighlight(card);
  return lead ? (
    <HighlightGroupCard card={card} lead={lead} tint={tint} className={className} />
  ) : (
    <PlainGroupCard card={card} tint={tint} className={className} />
  );
}
