import { Lock, Trophy } from "lucide-react";
import type { AchievementTier } from "@/lib/api/types";
import {
  isSpoiler,
  rarityTier,
  stableTilt,
  type AchievementView,
  type RarityTier,
} from "@/lib/achievements";
import { contrastOn } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";

// An Achievement's icon as a die-cut tile resting in its slot. Three states:
// - Unlocked (by the shown member): the art inside a 3px edge in its Rarity
//   ink, 6px corners and a stable tilt from the id. PSN trophies carry a
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

export const TIER_RING: Record<AchievementTier, string> = {
  bronze: "var(--color-tier-bronze)",
  silver: "var(--color-tier-silver)",
  gold: "var(--color-tier-gold)",
  platinum: "#d6e4ec",
};

const RARITY_EDGE: Record<RarityTier, string> = {
  common: "border-rarity-common",
  uncommon: "border-rarity-uncommon",
  rare: "border-rarity-rare",
  ultra: "border-rarity-ultra",
};

const SIZE = {
  sm: {
    box: "size-10",
    inset: "inset-[2px]",
    edge: "border-[3px]",
    glyph: "size-4",
    mark: "text-lg",
    dot: "size-2",
    label: false,
  },
  md: {
    box: "size-14",
    inset: "inset-[3px]",
    edge: "border-[3px]",
    glyph: "size-5",
    mark: "text-2xl",
    dot: "size-2.5",
    label: false,
  },
  lg: {
    box: "size-20",
    inset: "inset-1",
    edge: "border-[3px]",
    glyph: "size-7",
    mark: "text-4xl",
    dot: "size-3",
    label: true,
  },
  xl: {
    box: "size-32",
    inset: "inset-1.5",
    edge: "border-[5px]",
    glyph: "size-10",
    mark: "text-6xl",
    dot: "size-4",
    label: true,
  },
} as const;

export type AchievementIconSize = keyof typeof SIZE;

export type AchievementIconView = Pick<
  AchievementView,
  | "id"
  | "iconUrl"
  | "iconLockedUrl"
  | "unlocked"
  | "hardcore"
  | "tier"
  | "provider"
  | "rarity"
  | "hidden"
  | "viewerUnlocked"
>;

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

  return (
    <span
      className={cn(
        "relative block shrink-0 rounded-[6px]",
        view.unlocked && "shadow-[inset_0_0_0_1px_var(--color-border)]",
        s.box,
        className,
      )}
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

type SizeSpec = (typeof SIZE)[AchievementIconSize];

// The foil edge: a transparent border over the conic foil, the tile's ink
// clipped to the padding box so only the edge shows it.
const FOIL_EDGE: React.CSSProperties = {
  borderColor: "transparent",
  background:
    "linear-gradient(var(--color-muted), var(--color-muted)) padding-box, var(--foil-sheen) border-box, var(--foil-conic) border-box",
};

function UnlockedTile({
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

function SealedTile({
  id,
  s,
  tint,
}: {
  id: number;
  s: SizeSpec;
  tint?: string;
}) {
  return (
    <span
      className={cn(
        "absolute grid place-items-center overflow-hidden rounded-[6px] border border-border-strong bg-muted rotate-(--tilt)",
        s.inset,
      )}
      style={{ "--tilt": `${stableTilt(id)}deg` } as React.CSSProperties}
    >
      <span
        aria-hidden
        className="absolute h-[22%] w-[200%] -rotate-45 bg-border-strong"
        style={tint ? { background: tint } : undefined}
      />
      <span
        aria-hidden
        className={cn("font-headline relative leading-none text-foreground", s.mark)}
      >
        ?
      </span>
      {s.label && (
        <span className="font-label absolute bottom-1.5 text-[0.7rem] tracking-[0.14em] text-dim-foreground">
          Hidden
        </span>
      )}
    </span>
  );
}

function LockedSlot({
  s,
  slot,
  tint,
}: {
  s: SizeSpec;
  slot?: number;
  tint?: string;
}) {
  return (
    <span
      className={cn(
        "absolute grid place-items-center rounded-[6px] border-[1.5px] border-dashed border-border-strong",
        s.inset,
      )}
    >
      {slot != null ? (
        <span
          aria-hidden
          className={cn(
            "font-headline leading-none text-faint-foreground opacity-60",
            s.mark,
          )}
          style={tint ? { color: tint } : undefined}
        >
          {String(slot).padStart(2, "0")}
        </span>
      ) : (
        <Lock aria-hidden className={cn("text-faint-foreground", s.glyph)} />
      )}
    </span>
  );
}
