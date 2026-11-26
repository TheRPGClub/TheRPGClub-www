"use client";

import { useId, useState } from "react";
import { DeskSelect } from "@/components/admin/desk/desk-select";
import { defaultDestination, unshippedItems } from "@/lib/roadmap/edit";
import { milestoneDate } from "@/lib/roadmap/tree";
import type { RoadmapMilestone } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";
import { EditDialog } from "./edit-dialog";

const count = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

// Reach (edit-tray.html's dialog): the Milestone's Shipped items stay with
// it on the Shipped shelf; the ones not Shipped yet are listed and move to
// the Milestone picked here (the next one in order by default).
export function ReachDialog({ milestone }: { milestone: RoadmapMilestone }) {
  const editor = useEditor();
  const selectId = useId();
  const moving = unshippedItems(milestone);
  const staying = milestone.items.length - moving.length;
  const others = editor.roadmap.milestones.filter((m) => m.id !== milestone.id);
  const [destination, setDestination] = useState(() => String(defaultDestination(editor.roadmap, milestone.id)?.id ?? ""));
  const stuck = moving.length > 0 && others.length === 0;

  const description =
    moving.length === 0
      ? `Every item is Shipped, so ${count(staying)} ${staying === 1 ? "goes" : "go"} to the Shipped shelf with ${milestone.name}.`
      : stuck
        ? `${moving.length === 1 ? "This item isn't" : `These ${moving.length} aren't`} Shipped yet and there is no other open Milestone to move ${moving.length === 1 ? "it" : "them"} to. Add one first.`
        : `${count(staying)} ${staying === 1 ? "is" : "are"} Shipped and stay with ${milestone.name}. ${moving.length === 1 ? "This one isn't" : `These ${moving.length} aren't`} Shipped yet and move on:`;

  return (
    <EditDialog
      title={`Reach ${milestone.name}`}
      description={description}
      submitLabel={`Reach ${milestone.name}`}
      pendingLabel="Reaching..."
      canSubmit={!stuck}
      onSubmit={() => editor.reach(milestone.id, moving.length > 0 && destination ? Number(destination) : null)}
    >
      {moving.length > 0 && (
        <ul className="divide-y divide-border">
          {moving.map((item) => (
            <li key={item.id} className="py-1.5 font-semibold text-foreground">
              {item.title}
            </li>
          ))}
        </ul>
      )}
      {moving.length > 0 && !stuck && (
        <div className="space-y-1.5">
          <span id={selectId} className="font-label block text-[0.78rem] font-extrabold tracking-[0.1em] text-faint-foreground">
            Move them to
          </span>
          <DeskSelect
            groups={[{ options: others.map((m) => ({ value: String(m.id), label: `${m.name} (${milestoneDate(m)})` })) }]}
            value={destination}
            labelledBy={selectId}
            onValueChange={setDestination}
          />
        </div>
      )}
    </EditDialog>
  );
}
