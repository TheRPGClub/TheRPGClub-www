import { Lock, Trophy } from "lucide-react";
import type { AchievementTier } from "@/lib/api/types";
import type { AchievementView } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// An Achievement's icon. Locked icons use the Provider's locked art (Steam's
// grey icon) or are desaturated, with a lock marker. PSN trophies wear a
// ring in their tier's metal; RetroAchievements hardcore Unlocks carry an
// "HC" tag. Markup only, so it renders on the server or in a client grid.

// Muted metals, set as strokes, never fills: the gold stays ochre so it
// never reads as the highlighter yellow.
export const TIER_RING: Record<AchievementTier, string> = {
  bronze: "#b07a4f",
  silver: "#b4b8c0",
  gold: "#c9a03a",
  platinum: "#d6e4ec",
};

const SIZE = {
  sm: { box: "size-10", ring: 2, glyph: "size-4", tag: "text-[0.55rem] px-[3px]" },
  md: { box: "size-14", ring: 2, glyph: "size-5", tag: "text-[0.6rem] px-1" },
  lg: { box: "size-20", ring: 3, glyph: "size-7", tag: "text-[0.68rem] px-1" },
} as const;

export type AchievementIconSize = keyof typeof SIZE;

export function AchievementIcon({
  view,
  size = "md",
  className,
}: {
  view: Pick<
    AchievementView,
    "iconUrl" | "iconLockedUrl" | "unlocked" | "hardcore" | "tier" | "provider"
  >;
  size?: AchievementIconSize;
  className?: string;
}) {
  const s = SIZE[size];
  const locked = !view.unlocked;
  const src = locked && view.iconLockedUrl ? view.iconLockedUrl : view.iconUrl;
  // Only Steam ships a locked variant; the others are desaturated here.
  const dim = locked && !view.iconLockedUrl;
  const tier = view.provider === "psn" ? view.tier : null;
  const ring = tier
    ? `inset 0 0 0 ${s.ring}px ${TIER_RING[tier]}`
    : "inset 0 0 0 1px rgb(244 244 240 / 0.12)";

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-sm bg-ink-3",
        s.box,
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Provider icons
        <img
          src={src}
          alt=""
          loading="lazy"
          className={cn(
            "size-full object-cover",
            dim && "opacity-40 grayscale",
          )}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex size-full items-center justify-center text-paper-mute",
            locked && "opacity-50",
          )}
        >
          <Trophy className={s.glyph} />
        </span>
      )}
      {/* The ring sits over the art so dark icons keep their edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-sm"
        style={{ boxShadow: ring }}
      />
      {locked && (
        <span
          aria-hidden
          className="absolute right-0.5 bottom-0.5 flex items-center justify-center rounded-[2px] bg-ink/85 p-[2px] text-paper-dim [&_svg]:size-2.5"
        >
          <Lock />
        </span>
      )}
      {!locked && view.provider === "retroachievements" && view.hardcore && (
        <span
          aria-hidden
          className={cn(
            "font-label absolute bottom-0.5 left-0.5 rounded-[2px] bg-paper leading-[1.35] font-extrabold text-ink",
            s.tag,
          )}
        >
          HC
        </span>
      )}
    </span>
  );
}
