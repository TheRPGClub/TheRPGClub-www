"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { RoadmapMilestone } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";

// Deleting a Milestone. One that still has Roadmap Items can't go (spec
// api#505), so the dialog says why and what to do instead; an empty one
// asks once before it goes.
export function DeleteMilestoneDialog({ milestone }: { milestone: RoadmapMilestone }) {
  const editor = useEditor();
  const n = milestone.items.length;
  const close = (open: boolean) => !open && editor.closeDialog();

  if (n > 0) {
    return (
      <Dialog open onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{milestone.name} can&apos;t be deleted yet</DialogTitle>
            <DialogDescription>
              It still has {n} Roadmap {n === 1 ? "Item" : "Items"}. Drag {n === 1 ? "it" : "them"} to another Milestone
              or delete {n === 1 ? "it" : "them"} first, then delete the Milestone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={editor.closeDialog}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <ConfirmDialog
      open
      onOpenChange={close}
      title={`Delete ${milestone.name}?`}
      description="It has no items, and it can't be brought back."
      confirmLabel="Delete Milestone"
      pendingLabel="Deleting..."
      onConfirm={() => editor.deleteMilestone(milestone.id)}
    />
  );
}
