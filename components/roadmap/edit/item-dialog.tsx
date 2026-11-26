"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { itemDraft, itemPayload } from "@/lib/roadmap/edit";
import type { RoadmapItem } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";
import { EditDialog } from "./edit-dialog";
import { ItemFields } from "./item-fields";

// Adds a Roadmap Item to a Milestone, or edits one (the same dialog, per the
// owner's steer on pick 2). Editing also offers Delete, asked twice.
export function ItemDialog({ milestoneId, item }: { milestoneId: number; item: RoadmapItem | null }) {
  const editor = useEditor();
  const [draft, setDraft] = useState(() => itemDraft(item));
  const [confirming, setConfirming] = useState(false);
  const milestone = editor.roadmap.milestones.find((m) => m.id === milestoneId);

  return (
    <EditDialog
      title={item ? "Edit Roadmap Item" : "Add Roadmap Item"}
      description={
        item
          ? "Members see the title, blurb and area; the GitHub issue stays with staff."
          : `It joins the end of ${milestone?.name ?? "its Milestone"}.`
      }
      submitLabel={item ? "Save" : "Add item"}
      pendingLabel="Saving..."
      onSubmit={async () => {
        const checked = itemPayload(draft);
        return "error" in checked ? checked.error : editor.saveItem(milestoneId, item, draft);
      }}
      extra={(fail) =>
        item && (
          <Button
            type="button"
            variant={confirming ? "destructive-solid" : "destructive-ghost"}
            disabled={editor.pending}
            onClick={async () => {
              if (!confirming) return setConfirming(true);
              const failed = await editor.deleteItem(item.id);
              if (failed) fail(failed);
              else editor.closeDialog();
            }}
          >
            {confirming ? "Delete for good" : "Delete"}
          </Button>
        )
      }
    >
      <ItemFields draft={draft} onChange={setDraft} />
    </EditDialog>
  );
}
