"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { reorderMemberShelfAction } from "@/app/actions/member-shelf";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";
import { listPosition } from "@/lib/shelf-forms/manage";
import { moveItem, nudge } from "@/lib/shelf-forms/reorder";

interface Lift {
  id: number;
  // Its index on the page when it was picked up.
  from: number;
  order: number[];
}

/**
 * Reordering an ordered list on its page (spec api#451, pick 3A): an entry
 * is picked up, moved Earlier / Later (or dragged over another), then put
 * down, which saves its place as one `position` (api#452b). `ids` is the
 * page's order as read; `offset` is how many entries earlier pages hold.
 * The new order shows at once and gives way when the page re-reads.
 */
export function useShelfOrder({ userId, kind, ids, offset }: {
  userId: string;
  kind: MemberShelfKind;
  ids: number[];
  offset: number;
}) {
  const router = useRouter();
  const [lift, setLift] = useState<Lift | null>(null);
  const [placed, setPlaced] = useState<{ base: string; order: number[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const base = ids.join(",");
  const settled = placed && placed.base === base ? placed.order : ids;
  const order = lift?.order ?? settled;

  const pickUp = (id: number) => {
    const from = settled.indexOf(id);
    if (from < 0 || pending) return;
    setError(null);
    setLift({ id, from, order: settled });
  };
  const step = (by: -1 | 1) =>
    setLift((now) => {
      if (!now) return now;
      const next = nudge(now.order, now.order.indexOf(now.id), by);
      return next ? { ...now, order: next } : now;
    });
  // Dragged over another entry: take its place.
  const over = (targetId: number) =>
    setLift((now) => {
      if (!now || now.id === targetId) return now;
      return { ...now, order: moveItem(now.order, now.order.indexOf(now.id), now.order.indexOf(targetId)) };
    });
  const cancel = () => setLift(null);

  const put = () => {
    if (!lift) return;
    const to = lift.order.indexOf(lift.id);
    setLift(null);
    if (to === lift.from) return;
    setPlaced({ base, order: lift.order });
    startTransition(async () => {
      const result = await reorderMemberShelfAction(userId, kind, lift.id, listPosition(offset, to)).catch(() => null);
      if (!result?.ok) {
        setPlaced(null);
        setError(result?.error ?? "Couldn't reach the club's server. Try again.");
        return;
      }
      router.refresh();
    });
  };

  return {
    order,
    lifted: lift?.id ?? null,
    // The lifted entry's place in the whole list, then and now.
    places: lift ? { from: listPosition(offset, lift.from), to: listPosition(offset, lift.order.indexOf(lift.id)) } : null,
    atStart: lift ? lift.order.indexOf(lift.id) === 0 : false,
    atEnd: lift ? lift.order.indexOf(lift.id) === lift.order.length - 1 : false,
    pickUp,
    step,
    over,
    put,
    cancel,
    pending,
    error,
  };
}

export type ShelfOrder = ReturnType<typeof useShelfOrder>;
