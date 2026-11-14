"use client";

import { X } from "lucide-react";
import {
  HIGHLIGHT_LABEL,
  TIER_LABEL,
  displayRarity,
  formatRarity,
  formatUnlockDate,
  isSpoiler,
  rarityTier,
} from "@/lib/achievements";
import {
  formatSlot,
  type HeadlineReason,
  type SlottedAchievement,
} from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { SpoilerText } from "@/components/achievements/spoiler-text";
import { HeadlineChip } from "./shared";
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
  const shown = displayRarity(view);
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
      <button
        type="button"
        onClick={onClose}
        aria-label="Close details"
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-sm text-faint-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-highlight"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-end gap-4">
        <AchievementIcon view={view} size="lg" slot={slot} tint={tint} />
        <p className="font-label pb-1 text-[0.85rem] text-faint-foreground">
          No. <span style={{ color: tint }}>{formatSlot(slot)}</span>
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

      <div className="flex flex-wrap items-center gap-1.5">
        {sealedForViewer ? (
          <span className="font-label inline-flex h-6 items-center rounded-xs bg-foreground/8 px-2 text-[0.78rem] text-dim-foreground">
            Hidden
          </span>
        ) : (
          <RarityChip rarity={view.rarity} figure={shown.rarity} />
        )}
        {view.tier && view.provider === "psn" && (
          <span
            className={cn(
              "font-label inline-flex h-6 items-center rounded-xs bg-foreground/8 px-2 text-[0.78rem] text-dim-foreground",
              view.tier === "platinum" && "foil text-foil-foreground",
            )}
          >
            {view.tier === "platinum" ? HIGHLIGHT_LABEL.platinum : TIER_LABEL[view.tier]}
          </span>
        )}
        {headline && !(headline === "platinum" && view.tier === "platinum") && (
          <HeadlineChip reason={headline} className="bg-foreground/8 text-dim-foreground" />
        )}
      </div>

      <dl className="font-label grid grid-cols-[auto_1fr] text-[0.85rem]">
        <Fact term={view.unlocked ? "Unlocked" : "Unlock"}>
          {view.unlockedAt
            ? formatUnlockDate(view.unlockedAt)
            : `Not yet for ${memberName}`}
        </Fact>
        {shown.rarity != null && !sealedForViewer && (
          <Fact term={shown.hardcore ? "Rarity (hardcore)" : "Rarity"}>
            {formatRarity(shown.rarity)} of players
          </Fact>
        )}
        {view.points != null && view.points > 0 && (
          <Fact term="Points">{view.points}</Fact>
        )}
        {view.provider === "retroachievements" && view.unlocked && (
          <Fact term="Mode">{view.hardcore ? "Hardcore" : "Softcore"}</Fact>
        )}
      </dl>
    </article>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="border-t border-border py-2 text-faint-foreground">{term}</dt>
      <dd className="border-t border-border py-2 pl-4 text-right text-foreground normal-case tracking-normal">
        {children}
      </dd>
    </>
  );
}
