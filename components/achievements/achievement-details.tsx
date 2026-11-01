import { Lock } from "lucide-react";
import {
  TIER_LABEL,
  displayRarity,
  formatUnlockDate,
  isSpoiler,
  type AchievementView,
} from "@/lib/achievements";
import { AchievementIcon, TIER_RING } from "./achievement-icon";
import { RarityLabel } from "./rarity-label";
import { SpoilerText } from "./spoiler-text";

// The body of an Achievement's hover card: name, tier or points, the
// description, Rarity and the shown member's Unlock date. Hidden
// Achievements stay blurred until the viewer has unlocked them.
export function AchievementDetails({ view }: { view: AchievementView }) {
  const spoiler = isSpoiler(view);
  const ra = view.provider === "retroachievements";
  const tier = view.provider === "psn" ? view.tier : null;
  const rarity = displayRarity(view);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <AchievementIcon view={view} size="md" />
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-[0.95rem] leading-tight font-semibold text-paper">
            <SpoilerText spoiler={spoiler}>
              {view.name ?? "Untitled achievement"}
            </SpoilerText>
          </p>
          <div className="font-label flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.74rem] text-paper-mute">
            {tier && (
              <span className="inline-flex items-center gap-1.5 text-paper-dim">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ boxShadow: `inset 0 0 0 2px ${TIER_RING[tier]}` }}
                />
                {TIER_LABEL[tier]}
              </span>
            )}
            {view.points != null && view.points > 0 && (
              <span className="text-paper-dim">{view.points} pts</span>
            )}
            {view.hidden && <span>Hidden</span>}
          </div>
        </div>
      </div>

      {view.description && (
        <p className="text-[0.85rem] leading-snug text-paper-dim">
          <SpoilerText spoiler={spoiler}>{view.description}</SpoilerText>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-rule pt-2.5">
        {view.unlocked && view.unlockedAt ? (
          <span className="font-label text-[0.78rem] text-paper">
            Unlocked {formatUnlockDate(view.unlockedAt)}
            {ra && view.hardcore && (
              <span className="text-paper-mute"> · Hardcore</span>
            )}
          </span>
        ) : (
          <span className="font-label inline-flex items-center gap-1 text-[0.78rem] text-paper-mute [&_svg]:size-3">
            <Lock aria-hidden />
            Locked
          </span>
        )}
        <RarityLabel
          rarity={rarity.rarity}
          ultraRare={rarity.ultraRare}
          hardcore={rarity.hardcore}
        />
      </div>
    </div>
  );
}
