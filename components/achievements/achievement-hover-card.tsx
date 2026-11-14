"use client";

import { isSpoiler, type AchievementView } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AchievementDetails } from "./achievement-details";

// An Achievement's detail card, opened by hovering or focusing its trigger
// (usually the icon). The card is portaled so a grid never clips it, and it
// opens quicker than the default because grids are dense.
export function AchievementHoverCard({
  view,
  children,
  href,
  className,
}: {
  view: AchievementView;
  // The trigger's face, usually an AchievementIcon.
  children: React.ReactNode;
  // Makes the trigger a link. Taps never open a hover card, so a set page
  // points each icon at the Achievement's inline details.
  href?: string;
  className?: string;
}) {
  const label = isSpoiler(view)
    ? "Hidden achievement"
    : (view.name ?? "Untitled achievement");

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={120}
        closeDelay={80}
        // eslint-disable-next-line structure/no-raw-controls -- the hover card's own trigger, rendered as a plain focusable element so the icon keeps its face; a Button would restyle it
        render={href ? <a href={href} /> : <button type="button" />}
        aria-label={`${label}, ${view.unlocked ? "unlocked" : "locked"}`}
        className={cn(
          "block outline-none transition-transform duration-150",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-highlight",
          "motion-safe:hover:-translate-y-0.5 data-[popup-open]:-translate-y-0.5",
          className,
        )}
      >
        {children}
      </HoverCardTrigger>
      {/* Beside the tile, top-aligned, so the card never covers the set
          title or the tiles' names below; it flips left near the edge. */}
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={12}
        alignOffset={0}
        collisionPadding={16}
        className="w-72 max-w-[calc(100vw-24px)] p-3.5 text-[length:inherit]"
      >
        <AchievementDetails view={view} />
      </HoverCardContent>
    </HoverCard>
  );
}
