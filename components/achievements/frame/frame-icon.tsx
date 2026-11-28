import { Trophy } from "lucide-react";
import type { AchievementView } from "@/lib/achievements";
import { cn } from "@/lib/utils";

// An Achievement as a plain frame: its art in a square with a thin rule
// edge, no tilt, no Rarity border. `missing` draws the frame dark with the
// art faded (the locked art when the Provider has one). A hidden one the
// viewer hasn't unlocked shows a sealed "?" so its art doesn't spoil it.

const SIZE = {
  sm: "size-[34px]",
  md: "size-[52px]",
  lg: "size-16",
  xl: "size-24",
  // The game page's sheet: the frame fills its column.
  fill: "aspect-square w-full",
} as const;

export type FrameSize = keyof typeof SIZE;

export function FrameIcon({
  view,
  size = "md",
  missing = false,
  className,
}: {
  view: Pick<AchievementView, "iconUrl" | "iconLockedUrl" | "hidden" | "viewerUnlocked">;
  size?: FrameSize;
  missing?: boolean;
  className?: string;
}) {
  const sealed = view.hidden && !view.viewerUnlocked;
  const src = missing ? (view.iconLockedUrl ?? view.iconUrl) : view.iconUrl;
  // Theme hooks: `data-size` is the caller's size (a Theme may hold every
  // frame at one size); the corners and rule edge are the Theme's.
  return (
    <span
      data-slot="achievement-frame"
      data-size={size}
      data-state={sealed ? "hidden" : missing ? "missing" : src ? "art" : "noart"}
      className={cn(
        "relative block shrink-0 overflow-hidden bg-muted",
        missing && "bg-background",
        SIZE[size],
        className,
      )}
    >
      {sealed ? (
        <span aria-hidden className="font-headline flex size-full items-center justify-center text-faint-foreground">
          ?
        </span>
      ) : src ? (
        // eslint-disable-next-line @next/next/no-img-element -- Provider art from outside hosts, which next/image isn't configured for
        <img
          src={src}
          alt=""
          loading="lazy"
          className={cn("size-full object-cover", missing && "opacity-30 grayscale")}
        />
      ) : (
        <span aria-hidden className="flex size-full items-center justify-center text-faint-foreground [&_svg]:size-1/2">
          <Trophy />
        </span>
      )}
    </span>
  );
}
