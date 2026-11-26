"use client";

import { useEditor } from "./editor-context";
import { DeleteMilestoneDialog } from "./delete-milestone-dialog";
import { ItemDialog } from "./item-dialog";
import { MilestoneDialog } from "./milestone-dialog";
import { ReachDialog } from "./reach-dialog";

// Whichever editing dialog is open. Keyed, so each opening starts fresh.
export function RoadmapDialogs() {
  const { dialog } = useEditor();
  if (!dialog) return null;
  switch (dialog.kind) {
    case "item":
      return <ItemDialog key={`item-${dialog.item?.id ?? `new-${dialog.milestoneId}`}`} milestoneId={dialog.milestoneId} item={dialog.item} />;
    case "milestone":
      return <MilestoneDialog key={`milestone-${dialog.milestone?.id ?? "new"}`} milestone={dialog.milestone} />;
    case "reach":
      return <ReachDialog key={`reach-${dialog.milestone.id}`} milestone={dialog.milestone} />;
    case "delete":
      return <DeleteMilestoneDialog key={`delete-${dialog.milestone.id}`} milestone={dialog.milestone} />;
  }
}
