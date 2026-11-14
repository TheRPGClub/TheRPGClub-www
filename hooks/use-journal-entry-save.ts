"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJournalEntryAction, updateJournalEntryAction } from "@/app/actions/journals";
import { chapterHref } from "@/lib/journals";

// The journal editor's save: writes the next entry, or rewrites `entryId` in
// place. A save that files the entry under a game other than the chapter the
// editor sits in opens that game's chapter; the next entry saved in its own
// chapter clears the editor (`clear`) for another.
export function useJournalEntrySave({
  userId,
  entryId,
  previousGameId,
  chapterGameId,
  onSaved,
}: {
  userId: string;
  entryId?: number;
  previousGameId?: number;
  chapterGameId?: number | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(gameId: number | null, title: string, body: string, clear: () => void) {
    setError(null);
    if (gameId === null) {
      setError("Pick the game this entry is about.");
      return;
    }
    startTransition(async () => {
      const res = entryId
        ? await updateJournalEntryAction({ entryId, gameId, title, body, previousGameId })
        : await createJournalEntryAction({ userId, gameId, title, body });
      if (!res.ok) {
        setError(res.error ?? "Couldn't save the entry. Try again.");
        return;
      }
      if (gameId !== chapterGameId) {
        router.push(chapterHref(userId, gameId));
      } else if (!entryId) {
        clear();
      }
      onSaved?.();
    });
  }

  return { error, setError, pending, save };
}
