"use client";

import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const SELF_RING =
  "hover:outline-2 hover:outline-solid hover:outline-highlight data-[popup-open]:outline-2 data-[popup-open]:outline-solid data-[popup-open]:outline-highlight focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-highlight";

// The same outline, drawn on the frame inside a `ring="inner"` trigger.
export const FRAME_RING =
  "group-hover/frame:outline-2 group-hover/frame:outline-solid group-hover/frame:outline-highlight group-data-[popup-open]/frame:outline-2 group-data-[popup-open]/frame:outline-solid group-data-[popup-open]/frame:outline-highlight group-focus-visible/frame:outline-2 group-focus-visible/frame:outline-solid group-focus-visible/frame:outline-offset-2 group-focus-visible/frame:outline-highlight";

// A frame that opens its details on hover or keyboard focus. Hover lays a
// yellow outline on the frame; the card is portaled so rows and grids never
// clip it, and opens quickly because frames sit dense. `href` makes the
// frame a link (taps never open a hover card, so a tap follows it).
export function FrameHover({
  label,
  href,
  details,
  children,
  ring = "self",
  className,
}: {
  // The frame's accessible name ("Master of Arms, unlocked").
  label: string;
  href?: string;
  details: React.ReactNode;
  children: React.ReactNode;
  // Where hover and focus draw the yellow outline: on the trigger itself
  // (a frame alone), or on the frame inside it (`inner`: a frame with a
  // caption under it; the frame carries FRAME_RING).
  ring?: "self" | "inner";
  className?: string;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={100}
        closeDelay={80}
        // eslint-disable-next-line structure/no-raw-controls -- the hover card's own trigger, a plain focusable element so the frame keeps its face; a Button would restyle it
        render={href ? <a href={href} /> : <button type="button" />}
        aria-label={label}
        className={cn(
          "group/frame block outline-none",
          ring === "self" && SELF_RING,
          className,
        )}
      >
        {children}
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="w-76 max-w-[calc(100vw-24px)] p-0 text-[length:inherit]"
      >
        {details}
      </HoverCardContent>
    </HoverCard>
  );
}
