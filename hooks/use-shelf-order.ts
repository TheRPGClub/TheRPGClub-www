"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { reorderMemberShelfAction } from "@/app/actions/member-shelf";
import { useSortable } from "@/hooks/use-sortable";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";
import { listPosition } from "@/lib/shelf-forms/manage";

/**
 * Reordering an ordered list on its page (spec api#451) with the site's one
 * reorder pattern, Make Room (hooks/use-sortable.ts): the card itself drags
 * and the others make room. A drop saves the entry's new place as one
 * 1-based `position` across pages (api#452) and the API renumbers the rest.
 * `ids` is the page's order as read; `offset` is how many entries earlier
 * pages hold. The new order shows at once, gives way when the page re-reads,
 * and rolls back if the save fails.
 */
export function useShelfOrder({ userId, kind, ids, offset, disabled, name }: {
  userId: string;
  kind: MemberShelfKind;
  ids: number[];
  offset: number;
  disabled?: boolean;
  name: (id: number) => string;
}) {
  const router = useRouter();
  const [placed, setPlaced] = useState<{ base: string; order: number[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const base = ids.join(",");
  const settled = placed && placed.base === base ? placed.order : ids;

  const sortable = useSortable<"list", number>({
    zones: { list: settled },
    layout: "grid",
    disabled: disabled || pending,
    name,
    onDrop: (next, move) => {
      setError(null);
      setPlaced({ base, order: next.list });
      startTransition(async () => {
        const result = await reorderMemberShelfAction(userId, kind, move.id, listPosition(offset, move.index)).catch(() => null);
        if (!result?.ok) {
          setPlaced(null);
          setError(result?.error ?? "Couldn't reach the club's server. Try again.");
          return;
        }
        router.refresh();
      });
    },
  });

  return { ...sortable, order: sortable.zones.list, error };
}

export type ShelfOrder = ReturnType<typeof useShelfOrder>;
