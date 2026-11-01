"use client";

import { PreviewCard } from "@base-ui/react/preview-card";
import { isSpoiler, type AchievementView } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { AchievementDetails } from "./achievement-details";

// An Achievement's detail card, opened by hovering or focusing its trigger
// (usually the icon). The card is portaled so a grid never clips it, and it
// opens quicker than the default because grids are dense.
export function AchievementHoverCard({
  view,
  children,
  className,
}: {
  view: AchievementView;
  // The trigger's face, usually an AchievementIcon.
  children: React.ReactNode;
  className?: string;
}) {
  const label = isSpoiler(view)
    ? "Hidden achievement"
    : (view.name ?? "Untitled achievement");

  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger
        delay={120}
        closeDelay={80}
        render={<button type="button" />}
        aria-label={`${label}, ${view.unlocked ? "unlocked" : "locked"}`}
        className={cn(
          "block rounded-sm outline-none transition-transform duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
          "motion-safe:hover:-translate-y-0.5 data-[popup-open]:-translate-y-0.5",
          className,
        )}
      >
        {children}
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner sideOffset={8} collisionPadding={12} className="z-50">
          <PreviewCard.Popup
            className={cn(
              "w-72 max-w-[calc(100vw-24px)] origin-(--transform-origin) rounded-md border border-rule-strong bg-ink-2 p-3.5 text-paper shadow-[0_12px_30px_rgb(0_0_0/0.5)] outline-none",
              "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            )}
          >
            <AchievementDetails view={view} />
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
