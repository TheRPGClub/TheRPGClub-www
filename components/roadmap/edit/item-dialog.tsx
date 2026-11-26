"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { itemDraft, itemPayload } from "@/lib/roadmap/edit";
import type { RoadmapItem } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";
import { EditDialog } from "./edit-dialog";
import { ItemFields } from "./item-fields";

// Adds a Roadmap Item to a Milestone, or edits one (the same dialog, per the
// owner's steer on pick 2). Editing also offers Delete, asked twice. Once
// an add has created the item (its Shipped mark may still have failed), the
// dialog edits that item, so trying again never adds it twice.
export function ItemDialog({ milestoneId, item: opened }: { milestoneId: number; item: RoadmapItem | null }) {
  const editor = useEditor();
  const [item, setItem] = useState(opened);
  const [draft, setDraft] = useState(() => itemDraft(opened));
  const [confirming, setConfirming] = useState(false);
  const milestone = editor.roadmap.milestones.find((m) => m.id === milestoneId);

  return (
    <EditDialog
      title={item ? "Edit Roadmap Item" : "Add Roadmap Item"}
      description={
        item
          ? "Members see the title, blurb, area and linked Feedback; the GitHub issue stays with staff."
          : `It joins the end of ${milestone?.name ?? "its Milestone"}.`
      }
      submitLabel={item ? "Save" : "Add item"}
      pendingLabel="Saving..."
      onSubmit={async () => {
        const checked = itemPayload(draft);
        if ("error" in checked) return checked.error;
        const saved = await editor.saveItem(milestoneId, item, draft);
        setItem(saved.item);
        return saved.error;
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
      <ItemFields draft={draft} itemId={item?.id ?? null} onChange={setDraft} />
    </EditDialog>
  );
}
