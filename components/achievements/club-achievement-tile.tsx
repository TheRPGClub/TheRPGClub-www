"use client";

import { Popover } from "@base-ui/react/popover";
import {
  TIER_LABEL,
  isSpoiler,
  type AchievementView,
} from "@/lib/achievements";
import type { RingSpot } from "@/lib/achievements/game-page";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { AchievementIcon, TIER_RING, type AchievementIconSize } from "./achievement-icon";
import { RarityChip } from "./rarity-chip";
import { SpoilerText } from "./spoiler-text";

// One Achievement on a game's club page: its icon faded by how few of the
// set's members hold it, ringed by a dot per member (filled in the member's
// colour when they hold it), opening on hover, focus or tap to the members
// who unlocked it. The trigger's label names them too, for screen readers.

export interface RingDot {
  spot: RingSpot;
  color: string;
  on: boolean;
}

export interface TileHolder {
  userId: string;
  name: string;
}

const SPOT_CLASS: Record<RingSpot, string> = {
  "top-left": "top-0 left-0",
  top: "top-0 left-1/2 -translate-x-1/2",
  "top-right": "top-0 right-0",
  right: "top-1/2 right-0 -translate-y-1/2",
  "bottom-right": "right-0 bottom-0",
  bottom: "bottom-0 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-0 left-0",
  left: "top-1/2 left-0 -translate-y-1/2",
};

// The ring's padding around the icon and its dot size, per icon size.
const RING = {
  sm: { pad: "p-[7px]", dot: "size-[7px]" },
  md: { pad: "p-[9px]", dot: "size-[9px]" },
  lg: { pad: "p-[10px]", dot: "size-[10px]" },
  xl: { pad: "p-3", dot: "size-3" },
} as const;

export function ClubAchievementTile({
  view,
  size,
  slot,
  tint,
  opacity,
  dots,
  holders,
  memberCount,
  viewerId,
  foil = false,
  className,
}: {
  view: AchievementView;
  size: AchievementIconSize;
  slot: number;
  tint: string;
  // 0 when nobody holds it: the tile is the empty slot.
  opacity: number;
  dots: RingDot[];
  // Earliest Unlock first.
  holders: TileHolder[];
  memberCount: number;
  viewerId: string | null;
  // The PSN Platinum: a foil frame behind the tile.
  foil?: boolean;
  className?: string;
}) {
  const spoiler = isSpoiler(view);
  const name = spoiler ? "Hidden achievement" : (view.name ?? "Untitled achievement");
  const label =
    holders.length === 0
      ? `${name}. No member has unlocked it`
      : `${name}. Unlocked by ${holders.length} of ${memberCount}: ${holders
          .map((h) => (h.userId === viewerId ? `${h.name} (you)` : h.name))
          .join(", ")}`;
  const ring = RING[size];

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={120}
        closeDelay={80}
        aria-label={label}
        className={cn(
          "group/tile relative block rounded-[8px] outline-none",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-highlight",
          ring.pad,
          className,
        )}
      >
        {dots.map((dot) => (
          <span
            key={dot.spot}
            aria-hidden
            className={cn("absolute rounded-full", SPOT_CLASS[dot.spot], ring.dot)}
            style={{ background: dot.on ? dot.color : "var(--color-rule)" }}
          />
        ))}
        <span
          aria-hidden
          className={cn(
            "relative block rounded-[7px] motion-safe:transition-[opacity,translate] motion-safe:duration-200",
            "group-hover/tile:opacity-100! group-focus-visible/tile:opacity-100! group-data-[popup-open]/tile:opacity-100!",
            "motion-safe:group-hover/tile:-translate-y-0.5 motion-safe:group-data-[popup-open]/tile:-translate-y-0.5",
            foil && "foil p-[3px]",
          )}
          style={opacity > 0 ? { opacity } : undefined}
        >
          <AchievementIcon
            view={view}
            size={size}
            slot={slot}
            tint={tint}
            className={cn(foil && "rounded-[5px] bg-ink-2")}
          />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} collisionPadding={12} className="z-50">
          <Popover.Popup
            className={cn(
              "w-72 max-w-[calc(100vw-24px)] origin-(--transform-origin) rounded-md border border-rule-strong bg-ink-2 p-3.5 text-paper shadow-[0_12px_30px_rgb(0_0_0/0.5)] outline-none",
              "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <TileDetails
              view={view}
              spoiler={spoiler}
              holders={holders}
              memberCount={memberCount}
              viewerId={viewerId}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function TileDetails({
  view,
  spoiler,
  holders,
  memberCount,
  viewerId,
}: {
  view: AchievementView;
  spoiler: boolean;
  holders: TileHolder[];
  memberCount: number;
  viewerId: string | null;
}) {
  const tier = view.provider === "psn" ? view.tier : null;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <p className="text-[0.95rem] leading-tight font-semibold">
          <SpoilerText spoiler={spoiler}>
            {view.name ?? "Untitled achievement"}
          </SpoilerText>
        </p>
        {view.description && (
          <p className="text-[0.85rem] leading-snug text-paper-dim">
            <SpoilerText spoiler={spoiler}>{view.description}</SpoilerText>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <RarityChip rarity={view.rarity} size="sm" />
        {tier && (
          <span className="font-label inline-flex h-5 items-center gap-1.5 text-[0.74rem] text-paper-dim">
            <span
              aria-hidden
              className={cn("size-2 rounded-full", tier === "platinum" && "foil")}
              style={tier === "platinum" ? undefined : { background: TIER_RING[tier] }}
            />
            {TIER_LABEL[tier]}
          </span>
        )}
        {view.points != null && view.points > 0 && (
          <span className="font-label text-[0.74rem] text-paper-dim">
            {view.points} pts
          </span>
        )}
      </div>
      <div className="border-t border-rule pt-2.5">
        <p className="font-label mb-2 text-[0.78rem] tracking-[0.08em] text-paper-mute">
          {holders.length === 0
            ? "No member has unlocked it yet"
            : `Unlocked by ${holders.length} of ${memberCount}`}
        </p>
        {holders.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {holders.map((holder) => (
              <li key={holder.userId} className="flex items-center gap-2 text-[0.88rem]">
                <ReviewerAvatar userId={holder.userId} name={holder.name} size="sm" />
                <span className="truncate">{holder.name}</span>
                {holder.userId === viewerId && (
                  <span className="font-label text-[0.72rem] text-paper-mute">You</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
