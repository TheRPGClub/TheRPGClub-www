"use client";

import { useRef, useState } from "react";
import type { GameCompletion } from "@/lib/api/types";
import { groupByMonth } from "@/components/issue/member-completed-reel-entries";
import { ReelControls } from "@/components/issue/member-completed-reel-controls";
import { ReelSpotlight } from "@/components/issue/member-completed-reel-spotlight";
import { ReelStrip } from "@/components/issue/member-completed-reel-strip";

export type { ReelGroup } from "@/components/issue/member-completed-reel-entries";

// Completed games as a spotlight and a filmstrip: the selected completion
// fills a key-art spotlight with everything the list knows about it, and the
// page's completions run below as frames grouped by month. On a phone the
// strip is a grid of frames, never a sideways scroll.
export function CompletedReel({
  entries,
  ownerName,
  // Where this page's first entry sits in the whole filtered list.
  offset,
  total,
}: {
  entries: GameCompletion[];
  ownerName: string;
  offset: number;
  total: number;
}) {
  const [selected, setSelected] = useState(0);
  const spotRef = useRef<HTMLElement>(null);
  const groups = groupByMonth(entries);
  const current = entries[Math.min(selected, entries.length - 1)];
  if (!current) return null;

  const pick = (index: number) => {
    setSelected(index);
    const spot = spotRef.current;
    if (!spot) return;
    // Bring the spotlight back into view when the strip has scrolled it off
    // (always the case on a phone, where the frames stack below it).
    const top = spot.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      spot.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  };
  const step = (delta: number) =>
    setSelected((i) => (i + delta + entries.length) % entries.length);

  return (
    <div className="min-w-0 space-y-7">
      <ReelSpotlight
        ref={spotRef}
        current={current}
        ownerName={ownerName}
        controls={
          <ReelControls
            count={entries.length}
            position={offset + selected + 1}
            total={total}
            game={current.game}
            onStep={step}
          />
        }
      />
      <ReelStrip groups={groups} selected={selected} onPick={pick} />
    </div>
  );
}
