"use client";

import { useRef, useState, type ReactNode } from "react";
import type { GameCompletion } from "@/lib/api/types";
import { reelIndex, reelStep } from "@/lib/members/reel-selection";
import { groupByMonth } from "@/components/issue/member-completed-reel-entries";
import { ReelControls } from "@/components/issue/member-completed-reel-controls";
import { ReelSpotlight } from "@/components/issue/member-completed-reel-spotlight";
import { ReelStrip } from "@/components/issue/member-completed-reel-strip";

export type { ReelGroup } from "@/components/issue/member-completed-reel-entries";

// The list owner's hooks into the reel (spec api#451, pick 3A): Edit on the
// spotlight, the form that replaces it, and each frame's tools or hole.
export interface ReelManage {
  onEdit: (entry: GameCompletion) => void;
  editor: (entry: GameCompletion) => ReactNode | null;
  renderFrame: (entry: GameCompletion, frame: ReactNode) => ReactNode;
  // Removed (held behind Undo, or sent): never the spotlight.
  isRemoved: (entry: GameCompletion) => boolean;
}

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
  manage,
}: {
  entries: GameCompletion[];
  ownerName: string;
  offset: number;
  total: number;
  manage?: ReelManage;
}) {
  const [selected, setSelected] = useState(0);
  const spotRef = useRef<HTMLElement>(null);
  const groups = groupByMonth(entries);
  const removed = (i: number) => manage?.isRemoved(entries[i]) ?? false;
  // A removed completion hands the spotlight to the next one still there.
  const shown = reelIndex(selected, entries.length, removed);
  const current = entries[shown] ?? entries[Math.min(selected, entries.length - 1)];
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
    setSelected(reelStep(shown < 0 ? selected : shown, delta < 0 ? -1 : 1, entries.length, removed));

  return (
    <div className="min-w-0 space-y-7">
      <ReelSpotlight
        ref={spotRef}
        current={current}
        ownerName={ownerName}
        editor={manage?.editor(current)}
        controls={
          <ReelControls
            count={entries.length}
            position={offset + Math.max(shown, 0) + 1}
            total={total}
            game={current.game}
            onStep={step}
            onEdit={manage && shown >= 0 ? () => manage.onEdit(current) : undefined}
          />
        }
      />
      <ReelStrip
        groups={groups}
        selected={shown}
        onPick={pick}
        renderFrame={manage?.renderFrame}
      />
    </div>
  );
}
