"use client";

import { useRef, useState } from "react";
import * as act from "@/app/actions/roadmap";
import type { RoadmapResult } from "@/app/actions/roadmap";
import {
  applyItemZones,
  applyMilestoneOrder,
  itemZoneMilestone,
  reachLocally,
  removeItem,
  removeMilestone,
  setShipped,
  unreachLocally,
  upsertItem,
  upsertMilestone,
  type ItemDraft,
  type ItemZone,
  type ItemZones,
  type MilestoneDraft,
} from "@/lib/roadmap/edit";
import type { Roadmap, RoadmapItem, RoadmapMilestone } from "@/lib/roadmap/types";

// The dialog staff editing has open, if any.
export type RoadmapDialog =
  | { kind: "item"; milestoneId: number; item: RoadmapItem | null }
  | { kind: "milestone"; milestone: RoadmapMilestone | null }
  | { kind: "reach"; milestone: RoadmapMilestone }
  | { kind: "delete"; milestone: RoadmapMilestone };

const BUSY = "Wait a moment: the last change is still saving.";

// Staff editing on /roadmap (spec api#505, www#232): the Roadmap lives here
// once the page has read it. Every change shows at once, saves behind, and
// takes the API's answer; a refused or failed save puts the Roadmap back as
// it was and says why. One save runs at a time. Each change answers with an
// error to show, or null once saved, so a dialog can stay open on failure.
export function useRoadmapEditor(initial: Roadmap) {
  const [roadmap, setRoadmap] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dialog, setDialog] = useState<RoadmapDialog | null>(null);
  const current = useRef(roadmap);
  const busy = useRef(false);

  const show = (next: Roadmap) => {
    current.current = next;
    setRoadmap(next);
  };

  async function attempt<T>(
    optimistic: (r: Roadmap) => Roadmap,
    action: () => Promise<RoadmapResult<T>>,
    settle: (r: Roadmap, data: T) => Roadmap,
  ): Promise<RoadmapResult<T>> {
    if (busy.current) return { ok: false, error: BUSY };
    busy.current = true;
    setPending(true);
    setError(null);
    const before = current.current;
    show(optimistic(before));
    let result: RoadmapResult<T>;
    try {
      result = await action();
    } catch {
      result = { ok: false, error: "Couldn't save that. Try again." };
    }
    if (result.ok) show(settle(current.current, result.data));
    else show(before);
    busy.current = false;
    setPending(false);
    return result;
  }

  async function save<T>(
    optimistic: (r: Roadmap) => Roadmap,
    action: () => Promise<RoadmapResult<T>>,
    settle: (r: Roadmap, data: T) => Roadmap,
  ): Promise<string | null> {
    const result = await attempt(optimistic, action, settle);
    return result.ok ? null : result.error;
  }

  // A change made outside a dialog reports its failure on the page.
  const loud = async (p: Promise<string | null>) => {
    const failed = await p;
    if (failed) setError(failed);
  };
  const same = (r: Roadmap) => r;
  const whole = (_: Roadmap, doc: Roadmap) => doc;

  return {
    roadmap,
    editing,
    pending,
    error,
    dialog,
    openDialog: (d: RoadmapDialog) => {
      setError(null);
      setDialog(d);
    },
    closeDialog: () => setDialog(null),
    dismissError: () => setError(null),
    setEditing: (next: boolean) => {
      setEditing(next);
      setError(null);
    },

    saveItem: async (milestoneId: number, item: RoadmapItem | null, draft: ItemDraft) => {
      const saved = await attempt(same, () => (item ? act.updateRoadmapItemAction(item.id, draft) : act.createRoadmapItemAction(milestoneId, draft)), upsertItem);
      if (!saved.ok) return saved.error;
      const id = saved.data.id;
      if (draft.shipped === (saved.data.shipped_at !== null)) return null;
      return save((r) => setShipped(r, id, draft.shipped ? new Date().toISOString() : null), () => act.shipRoadmapItemAction(id, draft.shipped), upsertItem);
    },
    deleteItem: (id: number) => save((r) => removeItem(r, id), () => act.deleteRoadmapItemAction(id), same),
    toggleShipped: (item: RoadmapItem) => {
      const ship = item.shipped_at === null;
      return loud(save((r) => setShipped(r, item.id, ship ? new Date().toISOString() : null), () => act.shipRoadmapItemAction(item.id, ship), upsertItem));
    },
    // A Make Room drop: a reorder inside one Milestone, or a move to another.
    dropItem: (next: ItemZones, move: { id: number; from: ItemZone; to: ItemZone; index: number }) => {
      const to = itemZoneMilestone(move.to);
      const action =
        move.from === move.to ? () => act.orderRoadmapItemsAction(to, next[move.to]) : () => act.moveRoadmapItemAction(move.id, to, move.index + 1);
      return loud(save((r) => applyItemZones(r, next), action, whole));
    },

    saveMilestone: (milestone: RoadmapMilestone | null, draft: MilestoneDraft) =>
      save(same, () => (milestone ? act.updateMilestoneAction(milestone.id, draft) : act.createMilestoneAction(draft)), upsertMilestone),
    deleteMilestone: (id: number) => save((r) => removeMilestone(r, id), () => act.deleteMilestoneAction(id), same),
    orderMilestones: (ids: number[]) => loud(save((r) => applyMilestoneOrder(r, ids), () => act.orderMilestonesAction(ids), whole)),
    reach: (id: number, destinationId: number | null) =>
      save((r) => reachLocally(r, id, destinationId, new Date().toISOString()), () => act.reachMilestoneAction(id, destinationId), whole),
    unreach: (id: number) => loud(save((r) => unreachLocally(r, id), () => act.unreachMilestoneAction(id), whole)),
  };
}

export type RoadmapEditor = ReturnType<typeof useRoadmapEditor>;
