import Link from "next/link";
import type { AchievementUnlock } from "@/lib/api/types";
import {
  displayRarity,
  formatUnlockDate,
  isSpoiler,
  memberSetHref,
  setTitle,
  viewFromUnlock,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { AchievementHoverCard } from "./achievement-hover-card";
import { AchievementIcon } from "./achievement-icon";
import { ProviderBadge } from "./provider-badge";
import { RarityLabel } from "./rarity-label";
import { SpoilerText } from "./spoiler-text";

// A member's Unlocks as ruled rows, newest first as the API sends them: the
// icon (with its hover card), the name and description inline so phones can
// read them, then the set, Provider, date and Rarity. Hidden Achievements
// stay blurred until the viewer has unlocked them.
export function UnlockList({
  unlocks,
  userId,
  compact = false,
  className,
}: {
  unlocks: AchievementUnlock[];
  // The member whose Unlocks these are, for the set links.
  userId: string;
  // Drops the description, for the profile's short list.
  compact?: boolean;
  className?: string;
}) {
  return (
    <ul aria-label="Unlocks" className={cn("divide-y divide-rule", className)}>
      {unlocks.map((unlock) => {
        const view = viewFromUnlock(unlock);
        const spoiler = isSpoiler(view);
        const set = unlock.achievement_set;
        const rarity = displayRarity(view);
        const ra = view.provider === "retroachievements";
        return (
          <li key={unlock.id} className="flex items-start gap-3.5 py-3">
            <AchievementHoverCard view={view} className="shrink-0">
              <AchievementIcon view={view} size={compact ? "sm" : "md"} />
            </AchievementHoverCard>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-[0.95rem] leading-tight font-semibold text-paper">
                <SpoilerText spoiler={spoiler}>
                  {view.name ?? "Untitled achievement"}
                </SpoilerText>
              </p>
              {!compact && view.description && (
                <p className="line-clamp-2 text-[0.85rem] leading-snug text-paper-dim">
                  <SpoilerText spoiler={spoiler}>{view.description}</SpoilerText>
                </p>
              )}
              <div className="font-label flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.78rem] text-paper-mute">
                <Link
                  href={memberSetHref(userId, set.id)}
                  className="max-w-full truncate text-paper-dim transition-colors hover:text-highlight"
                >
                  {setTitle(set)}
                </Link>
                <ProviderBadge provider={view.provider} short className="h-5" />
                <span>
                  {formatUnlockDate(unlock.unlocked_at)}
                  {ra && unlock.hardcore ? " · Hardcore" : ""}
                </span>
                {!compact && (
                  <RarityLabel
                    rarity={rarity.rarity}
                    ultraRare={rarity.ultraRare}
                    hardcore={rarity.hardcore}
                  />
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
