import Link from "next/link";
import type { AchievementUnlock } from "@/lib/api/types";
import {
  HIGHLIGHT_LABEL,
  formatRarity,
  isSpoiler,
  memberSetHref,
  rarityTier,
  setTitle,
  viewFromUnlock,
  type RarityTier,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { AchievementIcon } from "./achievement-icon";
import { SpoilerText } from "./spoiler-text";

// A member's four rarest Unlocks (the summary's `rarest_unlocks`), laid on
// the page as large die-cut icons, each taped down at its own tilt. An
// Unlock that earned a Completion, Mastery or Platinum wears the foil edge
// and is captioned with it; the rest are captioned with their Rarity in the
// tier's ink. Each links to the member's set page.

const RARITY_TEXT: Record<RarityTier, string> = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  ultra: "text-rarity-ultra",
};

// Where each of the four rests: a tilt and a drop, so the row reads as laid
// by hand rather than gridded.
const LAY = [
  "-rotate-6 translate-y-1",
  "rotate-[4deg] translate-y-4",
  "-rotate-2 translate-y-0",
  "rotate-[7deg] translate-y-4",
] as const;

const FOIL_KINDS = new Set(["completion", "mastery", "platinum"]);

export function RarestUnlocks({
  unlocks,
  userId,
  className,
}: {
  unlocks: AchievementUnlock[];
  userId: string;
  className?: string;
}) {
  if (unlocks.length === 0) return null;
  return (
    <ul
      aria-label="Rarest Unlocks"
      className={cn("grid grid-cols-4 gap-x-2 pt-2 pb-5", className)}
    >
      {unlocks.slice(0, 4).map((unlock, i) => {
        const view = viewFromUnlock(unlock);
        const foil = unlock.highlight != null && FOIL_KINDS.has(unlock.highlight);
        const tier = rarityTier(view.rarity);
        const name = view.name ?? "Untitled achievement";
        return (
          <li key={unlock.id} className={cn("relative", LAY[i])}>
            <Link
              href={memberSetHref(userId, unlock.achievement_set.id)}
              title={setTitle(unlock.achievement_set)}
              className="group flex flex-col items-center gap-2 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight"
            >
              <span className="relative">
                <span
                  aria-hidden
                  className="absolute -top-1.5 left-1/2 z-10 h-3 w-8 -translate-x-1/2 -rotate-3 bg-paper/25"
                />
                <AchievementIcon
                  view={view}
                  size="lg"
                  foil={foil}
                  className="size-[4.25rem] sm:size-[5.375rem]"
                />
              </span>
              <span className="font-label flex flex-col items-center text-center text-[0.72rem] leading-[1.1] tracking-[0.05em] text-paper-dim">
                {foil && unlock.highlight ? (
                  <span className="font-extrabold text-paper">
                    {HIGHLIGHT_LABEL[unlock.highlight]}
                  </span>
                ) : view.rarity != null && tier ? (
                  <span className={cn("font-extrabold", RARITY_TEXT[tier])}>
                    {formatRarity(view.rarity)}
                  </span>
                ) : null}
                <span className="line-clamp-2 transition-colors group-hover:text-highlight">
                  <SpoilerText spoiler={isSpoiler(view)}>{name}</SpoilerText>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
