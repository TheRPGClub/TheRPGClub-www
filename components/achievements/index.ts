// Achievement Hub foundation (design-www-00). Achievement surfaces only.
// Copy says Achievement, Unlock, Highlight, Completion, Mastery, Platinum,
// Rarity; never sticker, album, pack or pull.
//
// Components
//   <AchievementIcon view size? slot? tint? foil? className?>
//     size: "sm" 40px | "md" 56px | "lg" 80px | "xl" 128px (or className
//     "size-auto w-full aspect-square" to fill a grid cell).
//     Unlocked: die-cut tile, 3px Rarity-ink edge, stable +-1.5deg tilt.
//     Hidden (spoiler, not unlocked): sealed tile, seal in `tint`, "?".
//     Locked: dashed slot showing `slot` (1-based) in `tint`, else a lock.
//     foil: foil die-cut edge (the Platinum/Mastery/Completion Unlock).
//   <ProviderBadge provider short? name? className?>   solid Provider chip,
//     ink type; `name` adds the member's Provider name (Linked Account chip)
//   <RarityChip rarity figure? showFigure? size?: "sm"|"md" className?>
//     "Ultra rare · 2.1%" in the tier's ink (tier from overall Rarity; a
//     different `figure` adds " · HC 3.1%"); null without a Rarity.
//   <RarityLabel rarity ultraRare hardcore? chip? className?>  label-voice line
//   <SetBadgeChip badge className?>   flat foil chip: Completion/Mastery/Platinum
//   <FoilStamp kind size?: "sm"|"md"|"lg" className?>  tilted foil stamp
//   <TintSpine tint width?=12 className?>  left-edge spine; parent `relative`
//   <TintBand tint={SetTint} as? className?>  solid title band, AA type
//   <SpoilerText spoiler className?>  blurred until clicked (hidden names)
//   <RarestUnlocks unlocks userId className?>  four rarest Unlocks, taped
//     down large; foil edge + Highlight caption, else Rarity in tier ink
//   member-binder: <BinderTotals totals linked>, <LinkedAccountChips
//     accounts>, <BinderIndexRow row number tint href>, <SlotDots earned
//     total tint>, <BinderRings count> (the member page's binder)
//
// Maps: PROVIDER_FILL (bg-provider-*), RARITY_FILL (bg-rarity-*), TIER_RING.
// Tokens: rarity-{common,uncommon,rare,ultra} (the Theme, themes/),
//   provider-{retroachievements,steam,psn} and tier-{bronze,silver,gold}
//   (fixed, app/globals.css), and the `foil` utility (Platinum, Mastery,
//   Completion only; never on text).
//
// Helpers
//   @/lib/achievements: rarityTier(rarity) -> RarityTier | null,
//     RARITY_TIER_LABEL, stableTilt(id) -> degrees.
//   @/lib/achievements/tint (server only):
//     getSetTint({ coverUrl?, iconUrl?, setId }): Promise<SetTint>
//   @/lib/achievements/tint-color (anywhere): type SetTint
//     { tint: string; contrast: "#0b0b0d" | "#f4f4f0" }, fallbackTint(setId).

export { AchievementIcon, TIER_RING, type AchievementIconSize } from "./achievement-icon";
export { FoilStamp } from "./foil-stamp";
export { PROVIDER_FILL, ProviderBadge } from "./provider-badge";
export { RARITY_FILL, RarityChip } from "./rarity-chip";
export { RarityLabel } from "./rarity-label";
export { SetBadgeChip } from "./set-badge";
export { SpoilerText } from "./spoiler-text";
export { TintBand, TintSpine } from "./tint";
export { RarestUnlocks } from "./rarest-unlocks";
export {
  BinderIndexRow,
  BinderRings,
  BinderTotals,
  LinkedAccountChips,
  SlotDots,
} from "./member-binder";
