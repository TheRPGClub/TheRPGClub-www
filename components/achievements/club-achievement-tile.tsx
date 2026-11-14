"use client";

import { Popover } from "@base-ui/react/popover";
import { isSpoiler, type AchievementView } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { AchievementIcon, type AchievementIconSize } from "./achievement-icon";
import { RING_PAD, RingDots, type RingDot, type TileHolder } from "./club-tile-ring";
import { TileDetails } from "./club-tile-details";

export type { RingDot, TileHolder };

// One Achievement on a game's club page: its icon faded by how few of the
// set's members hold it, ringed by a dot per member (filled in the member's
// colour when they hold it), opening on hover, focus or tap to the members
// who unlocked it. The trigger's label names them too, for screen readers.

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

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={120}
        closeDelay={80}
        aria-label={label}
        className={cn(
          "group/tile relative block rounded-[8px] outline-none",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-highlight",
          RING_PAD[size],
          className,
        )}
      >
        <RingDots dots={dots} size={size} />
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
            className={cn(foil && "rounded-[5px] bg-card")}
          />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        {/* Beside the tile, top-aligned, so the card never covers the set
            title or the tiles' names below; it flips left near the edge. */}
        <Popover.Positioner
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          className="z-50"
        >
          <Popover.Popup
            className={cn(
              "w-72 max-w-[calc(100vw-24px)] origin-(--transform-origin) rounded-md border border-border-strong bg-card p-3.5 text-foreground shadow-[0_12px_30px_rgb(0_0_0/0.5)] outline-none",
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
