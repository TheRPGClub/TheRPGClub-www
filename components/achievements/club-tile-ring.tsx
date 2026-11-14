import type { RingSpot } from "@/lib/achievements/game-page";
import { cn } from "@/lib/utils";
import type { AchievementIconSize } from "./achievement-icon";

// The ring round a club tile: one dot per ringed member at a fixed spot,
// filled in the member's colour when they hold the Achievement.

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
export const RING_PAD: Record<AchievementIconSize, string> = {
  sm: "p-[7px]",
  md: "p-[9px]",
  lg: "p-[10px]",
  xl: "p-3",
};

const RING_DOT: Record<AchievementIconSize, string> = {
  sm: "size-[7px]",
  md: "size-[9px]",
  lg: "size-[10px]",
  xl: "size-3",
};

export function RingDots({ dots, size }: { dots: RingDot[]; size: AchievementIconSize }) {
  return dots.map((dot) => (
    <span
      key={dot.spot}
      aria-hidden
      className={cn("absolute rounded-full", SPOT_CLASS[dot.spot], RING_DOT[size])}
      style={{ background: dot.on ? dot.color : "var(--color-border)" }}
    />
  ));
}
