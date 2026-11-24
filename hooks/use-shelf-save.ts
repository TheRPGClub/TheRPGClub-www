"use client";

import { useState, useTransition } from "react";

import { addToMemberShelfAction, updateMemberShelfEntryAction } from "@/app/actions/member-shelf";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";
import { shelfRefusal, type ShelfPayload, type ShelfRefusal } from "@/lib/shelf-forms/values";

// What a shelf form tells its host once a save went through (spec api#451):
// the host refreshes, closes the form, and may say what happened ("It left
// Now Playing").
export interface ShelfSaved {
  kind: MemberShelfKind;
  action: "added" | "updated";
  entryId: number;
  // A Game Completion logged with leave_now_playing: whether an entry left.
  leftNowPlaying?: boolean;
}

/**
 * Saving one shelf form: adds a new entry, or updates the one it edits, and
 * keeps a refusal to show on its field (422 `started_after_finished`...) or
 * at the form's foot.
 */
export function useShelfSave(
  userId: string,
  kind: MemberShelfKind,
  entryId: number | null,
  onSaved: (saved: ShelfSaved) => void,
) {
  const [refusal, setRefusal] = useState<ShelfRefusal | null>(null);
  const [pending, startTransition] = useTransition();

  const save = (payload: ShelfPayload) => {
    setRefusal(null);
    startTransition(async () => {
      const result = await (entryId === null
        ? addToMemberShelfAction(userId, kind, { gamedb_game_id: 0, ...payload })
        : updateMemberShelfEntryAction(userId, kind, entryId, payload)
      ).catch(() => null);
      if (!result) return setRefusal({ message: "Couldn't reach the club's server. Try again." });
      if (!result.ok || !result.data) {
        return setRefusal(shelfRefusal(result.code, result.error ?? "Couldn't save it."));
      }
      const data: { entry_id: number; left_now_playing?: boolean } = result.data;
      onSaved({
        kind,
        action: entryId === null ? "added" : "updated",
        entryId: data.entry_id,
        ...(data.left_now_playing !== undefined ? { leftNowPlaying: data.left_now_playing } : {}),
      });
    });
  };

  return { save, pending, refusal, clearRefusal: () => setRefusal(null) };
}
