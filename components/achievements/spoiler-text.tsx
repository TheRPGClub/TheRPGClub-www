"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// A hidden Achievement's name or description, blurred until clicked. Each
// element reveals on its own: clicking the name leaves the description
// blurred. Callers pass `spoiler` from isSpoiler (hidden && !viewer_unlocked);
// without it the text renders plainly.
export function SpoilerText({
  spoiler,
  children,
  className,
}: {
  spoiler: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!spoiler || revealed) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Hidden achievement. Reveal spoiler"
      title="Hidden achievement: click to reveal"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setRevealed(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setRevealed(true);
        }
      }}
      className={cn(
        "cursor-pointer rounded-[2px] select-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        className,
      )}
    >
      <span aria-hidden className="blur-[5px] transition-[filter] duration-150 hover:blur-[3px]">
        {children}
      </span>
    </span>
  );
}
