"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { removeMemberShelfEntryAction } from "@/app/actions/member-shelf";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";

/**
 * The owner's manage mode on one list page (spec api#451, pick 3A): which
 * entry is open in the editor, and removals held behind Undo. Every save
 * re-reads the page; a removal is only sent when its Undo runs out.
 */
export function useShelfManage(userId: string, kind: MemberShelfKind) {
  const router = useRouter();
  const [editing, setEditing] = useState<number | null>(null);
  // Game titles of held removals, for the Undo line.
  const [titles, setTitles] = useState<ReadonlyMap<number, string>>(() => new Map());
  const undo = useUndoDelete<number>({
    commit: async (entryId) => {
      const result = await removeMemberShelfEntryAction(userId, kind, entryId);
      if (!result.ok) return { error: result.error ?? "Couldn't remove it." };
      router.refresh();
    },
  });

  const remove = (entryId: number, title: string) => {
    setTitles((prev) => new Map(prev).set(entryId, title));
    setEditing((open) => (open === entryId ? null : open));
    undo.hold(entryId);
  };

  const saved = (result: ShelfSaved) => {
    setEditing(null);
    router.refresh();
    return result;
  };

  return {
    editing,
    edit: (entryId: number | null) => setEditing(entryId),
    remove,
    saved,
    undo,
    titleOf: (entryId: number) => titles.get(entryId) ?? "It",
    // Held removals in the order they were made, for the Undo lines.
    held: [...undo.held],
  };
}

export type ShelfManage = ReturnType<typeof useShelfManage>;
