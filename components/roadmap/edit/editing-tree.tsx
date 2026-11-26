"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortStatus } from "@/components/sortable/sort-status";
import { useSortable } from "@/hooks/use-sortable";
import { findItem, findMilestone, itemZoneMilestone, itemZones, type ItemZone } from "@/lib/roadmap/edit";
import { LearnedShelf } from "../learned-shelf";
import { SkillTree } from "../skill-tree";
import { useEditor } from "./editor-context";
import { EditableTier } from "./editable-tier";
import { RoadmapDialogs } from "./roadmap-dialogs";

// The Skill Tree in edit mode (design pick 2, Edit in place): items drag
// within and between tiers and the tiers drag into order (Make Room), each
// tier carries its Edit / Reach / Delete chips and a dashed "+ Add Roadmap
// Item", an "+ Add Milestone" closes the open tiers, and each Reached
// Milestone on the shelf can be un-reached.
export function EditingTree() {
  const editor = useEditor();
  const r = editor.roadmap;
  const items = useSortable<ItemZone, number>({
    zones: itemZones(r),
    layout: "grid",
    disabled: editor.pending,
    name: (id) => findItem(r, id)?.title ?? "This item",
    zoneName: (z) => findMilestone(r, itemZoneMilestone(z))?.name ?? "another Milestone",
    onDrop: (next, move) => editor.dropItem(next, move),
  });
  const tiers = useSortable<"tiers", number>({
    zones: { tiers: r.milestones.map((m) => m.id) },
    layout: "rows",
    disabled: editor.pending,
    name: (id) => findMilestone(r, id)?.name ?? "This Milestone",
    onDrop: (next) => editor.orderMilestones(next.tiers),
  });
  const byId = new Map(r.milestones.map((m) => [m.id, m]));
  const allItems = new Map(r.milestones.flatMap((m) => m.items).map((i) => [i.id, i]));

  const foot = (
    <>
      <div className="relative z-10 mt-6 pl-10 md:pl-0 md:text-center">
        <span className="inline-block bg-background md:px-3">
          <Button variant="add" onClick={() => editor.openDialog({ kind: "milestone", milestone: null })}>
            <Plus aria-hidden /> Add Milestone
          </Button>
        </span>
      </div>
      <LearnedShelf
        reached={r.reached}
        controls={(m) => (
          <Button variant="chip" size="xs" disabled={editor.pending} onClick={() => editor.unreach(m.id)}>
            Un-reach
          </Button>
        )}
      />
    </>
  );

  return (
    <div className="space-y-4">
      {editor.error && (
        <p role="alert" className="rounded-sm border-[1.5px] border-dashed border-destructive px-3 py-2 text-[0.92rem]">
          {editor.error}
        </p>
      )}
      <div {...tiers.zone("tiers")}>
        <SkillTree foot={foot}>
          {tiers.zones.tiers.map((id, i) => {
            const m = byId.get(id);
            return (
              m && <EditableTier key={id} milestone={m} first={i === 0} sortProps={tiers.item(id)} board={items} items={allItems} />
            );
          })}
        </SkillTree>
      </div>
      <SortStatus status={items.status} />
      <SortStatus status={tiers.status} />
      <RoadmapDialogs />
    </div>
  );
}
