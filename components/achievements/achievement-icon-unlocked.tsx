import { Trophy } from "lucide-react";
import { rarityTier, stableTilt } from "@/lib/achievements";
import { contrastOn } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";
import { RARITY_EDGE, TIER_RING, type AchievementIconView, type SizeSpec } from "./achievement-icon-sizes";

// An Unlocked tile: the art inside a 3px edge in its Rarity ink (or foil),
// tilted; a PSN tier dot or a RetroAchievements "HC" tag in its corner.
// Without art it fills with the game tint and shows the slot number.

// The foil edge: a transparent border over the conic foil, the tile's ink
// clipped to the padding box so only the edge shows it.
const FOIL_EDGE: React.CSSProperties = {
  borderColor: "transparent",
  background:
    "linear-gradient(var(--color-muted), var(--color-muted)) padding-box, var(--foil-sheen) border-box, var(--foil-conic) border-box",
};

export function UnlockedTile({
  view,
  s,
  foil,
  slot,
  tint,
}: {
  view: AchievementIconView;
  s: SizeSpec;
  foil: boolean;
  slot?: number;
  tint?: string;
}) {
  const tier = rarityTier(view.rarity);
  const psnTier = view.provider === "psn" ? view.tier : null;
  // Without art, the tile is the tint with its contrast type.
  const ink = !view.iconUrl && tint ? contrastOn(tint) : null;
  const fill = ink && tint ? tint : null;
  return (
    <span
      className={cn(
        "absolute overflow-hidden rounded-[6px] bg-muted shadow-[0_3px_6px_rgb(0_0_0/0.45)]",
        "rotate-(--tilt) motion-safe:transition-[rotate] motion-safe:duration-200 hover:rotate-0",
        s.inset,
        s.edge,
        tier ? RARITY_EDGE[tier] : "border-faint-foreground",
      )}
      style={
        {
          "--tilt": `${stableTilt(view.id)}deg`,
          ...(foil ? FOIL_EDGE : null),
          ...(fill
            ? foil
              ? {
                  background: `linear-gradient(${fill}, ${fill}) padding-box, var(--foil-sheen) border-box, var(--foil-conic) border-box`,
                }
              : { background: fill }
            : null),
        } as React.CSSProperties
      }
    >
      {view.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Provider icons
        <img
          src={view.iconUrl}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center text-dim-foreground"
          style={ink ? { color: ink } : undefined}
        >
          {fill && slot != null ? (
            <span className={cn("font-headline leading-none", s.mark)}>
              {String(slot).padStart(2, "0")}
            </span>
          ) : (
            <Trophy className={s.glyph} />
          )}
        </span>
      )}
      {psnTier && (
        <span
          aria-hidden
          className={cn(
            "absolute right-0.5 bottom-0.5 rounded-full shadow-[0_0_0_2px_var(--color-background)]",
            s.dot,
            psnTier === "platinum" && "foil",
          )}
          style={
            psnTier === "platinum" ? undefined : { background: TIER_RING[psnTier] }
          }
        />
      )}
      {view.provider === "retroachievements" && view.hardcore && (
        <span
          aria-hidden
          className="font-label absolute bottom-0.5 left-0.5 rounded-[2px] bg-foreground px-[3px] py-px text-[11px] leading-none font-extrabold text-background"
        >
          HC
        </span>
      )}
    </span>
  );
}
