"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SortItemProps, useSortable } from "@/hooks/use-sortable";
import { itemZoneKey, type ItemZone } from "@/lib/roadmap/edit";
import type { RoadmapItem, RoadmapMilestone } from "@/lib/roadmap/types";
import { RoadmapNode } from "../roadmap-node";
import { Branches } from "../skill-tree";
import { TierBand } from "../tier-band";
import { useEditor } from "./editor-context";
import { NodeTools } from "./node-tools";
import { TierControls } from "./tier-controls";

type ItemBoard = ReturnType<typeof useSortable<ItemZone, number>>;

// The node's own ground and ring would cover Make Room's hatched gap, so
// while it is the gap it takes the gap's yellow ring instead.
const GAP = "data-[sort-state=gap]:shadow-[inset_0_0_0_1.5px_var(--color-highlight)]";

// One open Milestone in edit mode. The tier itself drags by its band (the
// branches are their own Make Room board, so a press there drags an item).
export function EditableTier({
  milestone,
  first,
  sortProps,
  board,
  items,
}: {
  milestone: RoadmapMilestone;
  first: boolean;
  sortProps: SortItemProps;
  board: ItemBoard;
  items: Map<number, RoadmapItem>;
}) {
  const editor = useEditor();
  const zone = itemZoneKey(milestone.id);
  const headingId = `milestone-${milestone.id}`;
  return (
    <li aria-labelledby={headingId} {...sortProps}>
      <TierBand milestone={milestone} first={first} headingId={headingId} controls={<TierControls milestone={milestone} />} />
      <div data-no-drag>
        <Branches {...board.zone(zone)}>
          {(board.zones[zone] ?? []).map((id) => {
            const item = items.get(id);
            if (!item) return null;
            return (
              <RoadmapNode
                key={id}
                item={item}
                later={!first}
                className={GAP}
                after={<NodeTools item={item} milestoneId={milestone.id} />}
                {...board.item(id)}
              />
            );
          })}
          <li className="flex">
            <Button
              variant="add"
              className="min-h-[3.25rem] w-full"
              onClick={() => editor.openDialog({ kind: "item", milestoneId: milestone.id, item: null })}
            >
              <Plus aria-hidden /> Add Roadmap Item
            </Button>
          </li>
        </Branches>
      </div>
    </li>
  );
}
