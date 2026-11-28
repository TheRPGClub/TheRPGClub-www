import { isSpoiler, rarityTier } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import {
  SIZE,
  TIER_RING,
  type AchievementIconSize,
  type AchievementIconView,
} from "./achievement-icon-sizes";
import { LockedSlot, SealedTile } from "./achievement-icon-empty";
import { UnlockedTile } from "./achievement-icon-unlocked";

// An Achievement's icon as a die-cut tile resting in its slot. Three states:
// - Unlocked (by the shown member): the art inside a 3px edge in its Rarity
//   ink (the Theme gives it its corners and, in the Monthly Issue, a stable
//   tilt from the id). PSN trophies carry a
//   corner dot in their tier's metal (Platinum is foil); RetroAchievements
//   hardcore Unlocks carry an "HC" tag. With no art, the tile fills with
//   the game tint and shows the slot number (or a trophy) in its contrast.
// - Hidden (a spoiler: hidden and the viewer hasn't unlocked it, and the
//   shown member hasn't either): a sealed tile crossed by a diagonal seal in
//   the game tint, with a "?".
// - Locked: the empty slot, a dashed outline with the slot number in the
//   game tint (or a lock when no number is given).
// Markup only, so it renders on the server or inside a client grid. The
// tile is decorative: callers name the Achievement beside it.

export { TIER_RING, type AchievementIconSize, type AchievementIconView };

export function AchievementIcon({
  view,
  size = "md",
  slot,
  tint,
  foil = false,
  className,
}: {
  view: AchievementIconView;
  size?: AchievementIconSize;
  // A foil die-cut edge in place of the Rarity ink: only for the Unlock
  // behind a Platinum, Mastery or Completion.
  foil?: boolean;
  // The slot number a locked tile shows (1-based, set order).
  slot?: number;
  // The game tint (SetTint.tint): the hidden seal, the slot number and the
  // fill of an unlocked tile without art.
  tint?: string;
  className?: string;
}) {
  const s = SIZE[size];
  const sealed = !view.unlocked && isSpoiler(view);
  const rarity = view.unlocked ? rarityTier(view.rarity) : null;

  // Theme hooks: the shape, the tilt and the rim live in each Theme's
  // achievements stylesheet, keyed by these attributes. `data-size` is the
  // caller's size; a Theme may hold every icon at one size.
  return (
    <span
      data-slot="achievement-icon"
      data-size={size}
      data-state={view.unlocked ? "unlocked" : sealed ? "hidden" : "locked"}
      data-rarity={rarity ?? undefined}
      data-foil={view.unlocked && foil ? "" : undefined}
      className={cn("relative block shrink-0", s.box, className)}
      style={tint ? ({ "--tint": tint } as React.CSSProperties) : undefined}
    >
      {view.unlocked ? (
        <UnlockedTile view={view} s={s} foil={foil} slot={slot} tint={tint} />
      ) : sealed ? (
        <SealedTile id={view.id} s={s} tint={tint} />
      ) : (
        <LockedSlot s={s} slot={slot} tint={tint} />
      )}
    </span>
  );
}
