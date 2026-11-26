"use client";

import { Button } from "@/components/ui/button";
import type { RoadmapMilestone } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";

// The chips under a tier band in edit mode: Edit (the Milestone dialog),
// Reach (the Reach dialog) and Delete (which says why when it can't).
export function TierControls({ milestone }: { milestone: RoadmapMilestone }) {
  const editor = useEditor();
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 md:justify-center">
      <Button variant="chip" size="xs" onClick={() => editor.openDialog({ kind: "milestone", milestone })}>
        Edit
      </Button>
      <Button variant="chip" size="xs" disabled={editor.pending} onClick={() => editor.openDialog({ kind: "reach", milestone })}>
        Reach
      </Button>
      <Button variant="chip" size="xs" onClick={() => editor.openDialog({ kind: "delete", milestone })}>
        Delete
      </Button>
    </div>
  );
}
