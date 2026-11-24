"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addToMemberShelfAction, removeMemberShelfEntryAction } from "@/app/actions/member-shelf";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";
import type { Game } from "@/lib/api/types";
import { COMPLETION_TYPES, OWNERSHIP_TYPES } from "@/lib/member-shelf/entry-meta";

/**
 * One of the member's lists as it is edited: whether the add panel is open,
 * the options a new entry is added with, and adding or removing an entry.
 * Every change refreshes the page so the shelf shows the list as stored.
 */
export function useMemberShelfEditor(userId: string, kind: MemberShelfKind) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [platformId, setPlatformId] = useState<number | null>(null);
  const [completionType, setCompletionType] = useState<string>(COMPLETION_TYPES[0]);
  const [ownershipType, setOwnershipType] = useState<string>(OWNERSHIP_TYPES[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const add = (game: Game) => {
    setError(null);
    startTransition(async () => {
      const result = await addToMemberShelfAction(userId, kind, {
        gamedb_game_id: game.game_id,
        platform_id: platformId,
        ...(kind === "completed" ? { completion_type: completionType } : {}),
        ...(kind === "collection" ? { ownership_type: ownershipType } : {}),
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to add.");
        return;
      }
      setAdding(false);
      setPlatformId(null);
      router.refresh();
    });
  };

  const remove = (entryId: number | undefined) => {
    if (entryId === undefined) {
      setError("Couldn't determine this entry's id — try refreshing the page.");
      return;
    }
    if (!confirm("Remove this entry?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeMemberShelfEntryAction(userId, kind, entryId);
      if (!result.ok) {
        setError(result.error ?? "Failed to remove.");
        return;
      }
      router.refresh();
    });
  };

  const open = () => {
    setAdding(true);
    setError(null);
  };
  const close = () => {
    setAdding(false);
    setPlatformId(null);
  };

  return {
    adding,
    open,
    close,
    add,
    remove,
    error,
    pending,
    options: {
      platformId,
      setPlatformId,
      completionType,
      setCompletionType,
      ownershipType,
      setOwnershipType,
    },
  };
}

export type MemberShelfOptions = ReturnType<typeof useMemberShelfEditor>["options"];
