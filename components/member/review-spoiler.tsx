"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Click-to-reveal spoiler text, for the read-only render of a review.
 *
 * A client island inside the otherwise server-rendered body (see
 * ./review-body.tsx) — the reveal is the only part of a review that needs
 * JavaScript.
 *
 * Hidden, this is a `span[role="button"]`; revealed, the role and tabstop go
 * away entirely. That matters because a spoiler may wrap a link: a focusable
 * anchor inside a focusable button is invalid, and the revealed state is
 * exactly when the link becomes usable.
 */
export function ReviewSpoiler({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <span className="rounded-[2px] bg-ink-3 px-[3px] outline-1 outline-offset-1 outline-rule-strong">
        {children}
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Reveal spoiler"
      title="Reveal spoiler"
      onClick={() => setRevealed(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setRevealed(true);
        }
      }}
      className={cn(
        "cursor-pointer rounded-[2px] bg-paper-dim px-[3px] text-transparent [box-decoration-break:clone] transition-colors hover:bg-paper",
        "select-none [&_*]:text-transparent",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
      )}
    >
      {children}
    </span>
  );
}
