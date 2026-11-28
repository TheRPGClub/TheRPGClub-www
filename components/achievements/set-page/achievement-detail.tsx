"use client";

import { X } from "lucide-react";
import { isSpoiler, rarityTier } from "@/lib/achievements";
import {
  formatSlot,
  type HeadlineReason,
  type SlottedAchievement,
} from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { SpoilerText } from "@/components/achievements/spoiler-text";
import { Button } from "@/components/ui/button";
import { DetailChips, DetailFacts } from "./detail-facts";
import { cn } from "@/lib/utils";

const EDGE: Record<string, string> = {
  common: "border-t-rarity-common",
  uncommon: "border-t-rarity-uncommon",
  rare: "border-t-rarity-rare",
  ultra: "border-t-rarity-ultra",
};

// One Achievement laid open: its tile, number, name, description, Rarity
// and the shown member's Unlock. The side card on the spread's right page
// (desktop) and the card that opens under a picked item (phones). Hidden
// Achievements keep their name and description blurred until clicked,
// unless the viewer has unlocked them.
export function AchievementDetail({
  item,
  tint,
  memberName,
  headline,
  onClose,
  id,
  className,
}: {
  item: SlottedAchievement;
  tint: string;
  memberName: string;
  // The headline reason, when this is the set's headline Achievement.
  headline?: HeadlineReason | null;
  onClose: () => void;
  id?: string;
  className?: string;
}) {
  const { view, slot } = item;
  const spoiler = isSpoiler(view);
  const tier = rarityTier(view.rarity);
  const sealedForViewer = spoiler && !view.unlocked;

  return (
    <article
      id={id}
      aria-label={`No. ${formatSlot(slot)}`}
      className={cn(
        "relative flex flex-col gap-4 rounded-md border-t-[3px] bg-muted p-5",
        tier ? EDGE[tier] : "border-t-border-strong",
        className,
      )}
    >
      <Button
        variant="dismiss"
        size="icon"
        onClick={onClose}
        aria-label="Close details"
        className="absolute top-3 right-3 grid place-items-center border-0 active:not-aria-[haspopup]:translate-y-0"
      >
        <X className="size-4" />
      </Button>

      <div className="flex items-end gap-4">
        <AchievementIcon view={view} size="lg" slot={slot} tint={tint} />
        <p className="font-label pb-1 text-[0.85rem] text-faint-foreground">
          No. <span data-slot="detail-slot-number" style={{ color: tint }}>{formatSlot(slot)}</span>
        </p>
      </div>

      <h3 className="font-headline border-b-2 border-foreground pb-2 text-[1.9rem] leading-[0.95] break-words text-foreground">
        {view.name ? (
          <SpoilerText spoiler={spoiler}>{view.name}</SpoilerText>
        ) : (
          "Untitled Achievement"
        )}
      </h3>

      {view.description && (
        <p className="max-w-[48ch] text-[0.95rem] leading-relaxed text-dim-foreground">
          <SpoilerText spoiler={spoiler}>{view.description}</SpoilerText>
        </p>
      )}

      <DetailChips view={view} headline={headline} sealed={sealedForViewer} />
      <DetailFacts view={view} memberName={memberName} sealed={sealedForViewer} />
    </article>
  );
}
