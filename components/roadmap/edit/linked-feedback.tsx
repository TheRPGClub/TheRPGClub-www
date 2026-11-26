"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { feedbackLine } from "@/lib/roadmap/feedback";
import type { RoadmapFeedback, RoadmapItem } from "@/lib/roadmap/types";

// The Feedback an item links, in the item dialog: each with its kind and
// state and an Unlink. One still on another item says it moves here on save.
export function LinkedFeedback({
  feedback,
  holder,
  onUnlink,
}: {
  feedback: RoadmapFeedback[];
  holder: (f: RoadmapFeedback) => RoadmapItem | null;
  onUnlink: (id: number) => void;
}) {
  if (feedback.length === 0) {
    return <p className="text-xs text-faint-foreground">None linked. Members see linked Feedback on the board as On the Roadmap.</p>;
  }
  return (
    <ul aria-label="Linked Feedback" className="divide-y divide-border rounded-sm border border-border-strong">
      {feedback.map((f) => {
        const from = holder(f);
        return (
          <li key={f.id} className="flex items-center gap-2 py-1.5 pr-1 pl-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{f.title}</span>
              <span className="font-label block text-[0.7rem] text-faint-foreground">{feedbackLine(f)}</span>
              {from && <span className="block text-xs text-highlight">Moves here from “{from.title}” when you save</span>}
            </span>
            <Button type="button" variant="field-tool" size="icon-xs" aria-label={`Unlink ${f.title}`} title="Unlink" onClick={() => onUnlink(f.id)}>
              <X aria-hidden />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
