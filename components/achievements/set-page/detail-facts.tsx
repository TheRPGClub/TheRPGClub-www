"use client";

import {
  HIGHLIGHT_LABEL,
  TIER_LABEL,
  displayRarity,
  formatRarity,
  formatUnlockDate,
  type AchievementView,
} from "@/lib/achievements";
import type { HeadlineReason } from "@/lib/achievements/set-page";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { cn } from "@/lib/utils";
import { HeadlineChip } from "./shared";

// The picked Achievement's chips (its Rarity, its PSN tier, why it heads the
// set) and its facts (the shown member's Unlock, Rarity, points, mode).

export function DetailChips({
  view,
  headline,
  sealed,
}: {
  view: AchievementView;
  headline?: HeadlineReason | null;
  // Hidden and not unlocked by the viewer: no Rarity to give it away.
  sealed: boolean;
}) {
  const shown = displayRarity(view);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sealed ? (
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
  );
}

export function DetailFacts({
  view,
  memberName,
  sealed,
}: {
  view: AchievementView;
  memberName: string;
  sealed: boolean;
}) {
  const shown = displayRarity(view);
  return (
    <dl className="font-label grid grid-cols-[auto_1fr] text-[0.85rem]">
      <Fact term={view.unlocked ? "Unlocked" : "Unlock"}>
        {view.unlockedAt
          ? formatUnlockDate(view.unlockedAt)
          : `Not yet for ${memberName}`}
      </Fact>
      {shown.rarity != null && !sealed && (
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
