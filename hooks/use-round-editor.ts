"use client";

import { useState, useTransition } from "react";
import { updateRoundEntriesAction, type RoundEntryEdit } from "@/app/actions/rounds";
import type { AdminRoundEntry } from "@/lib/api/admin-rounds";
import type { VotingCategory } from "@/lib/api/types";
import {
  duplicateGames,
  listNames,
  roundEntryEdit,
  roundEntryId,
  roundSaveFailure,
  roundSlotOf,
  slotName,
  type RoundSlot,
} from "@/lib/rounds";

// One track's round in the editor: the slots as saved and as edited, the
// slots holding the same game, and the save. Only changed slots are sent,
// one PATCH each; the round is checked as a whole first, so games can be
// swapped between slots; a refusal partway names the slots that saved and
// reloads the round.
export function useRoundEditor(category: VotingCategory, roundNumber: number, entries: AdminRoundEntry[]) {
  const [saved, setSaved] = useState<RoundSlot[]>(() => entries.map(roundSlotOf));
  const [slots, setSlots] = useState<RoundSlot[]>(() => entries.map(roundSlotOf));
  const [picking, setPicking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [pending, startTransition] = useTransition();

  const edits = slots.map((slot, i) => roundEntryEdit(slot, saved[i])).filter((e): e is RoundEntryEdit => e !== null);

  // Slot position -> the other slots holding the same game.
  const dupes = duplicateGames(slots.map((s) => s.gameId));
  const twinOf = new Map<number, number[]>();
  for (const at of dupes.values()) for (const i of at) twinOf.set(i, at.filter((j) => j !== i));

  const update = (i: number, patch: Partial<RoundSlot>) =>
    setSlots((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (edits.length === 0) return;
    if (dupes.size > 0) {
      const [first] = dupes.values();
      const title = slots[first[0]].game?.title ?? `GameDB game ${slots[first[0]].gameId}`;
      setError(
        `${title} would be in the round twice (${listNames(first.map((i) => slotName(i, slots.length)))}). Change one of them before saving.`,
      );
      return;
    }
    setError(null);
    const sent = slots;
    startTransition(async () => {
      const result = await updateRoundEntriesAction(category, roundNumber, edits);
      const savedIds = new Set(result.savedIds ?? []);
      if (result.jobId != null) setJobId(result.jobId);
      if (savedIds.size > 0) setSavedOnce(true);

      if (!result.ok && result.round) {
        // Start again from what the server holds; slots that didn't save
        // keep their draft so they still read as Changed.
        const fresh = result.round.map(roundSlotOf);
        setSaved(fresh);
        setSlots(
          fresh.map((slot) => {
            const draft = sent.find((s) => s.id === slot.id);
            return draft && !savedIds.has(slot.id) ? draft : slot;
          }),
        );
      } else {
        const updated = new Map((result.entries ?? []).map((entry) => [roundEntryId(entry), entry]));
        // Keep the picked Game for the proof; the PATCH answers without it.
        setSaved((list) =>
          list.map((s, i) => {
            const entry = updated.get(s.id);
            return entry ? { ...roundSlotOf(entry), game: sent[i].game } : s;
          }),
        );
      }

      if (!result.ok) {
        setError(
          roundSaveFailure({
            slotIds: sent.map((s) => s.id),
            triedIds: edits.map((e) => e.id),
            savedIds: [...savedIds],
            error: result.error,
            reloaded: result.round === undefined ? undefined : result.round !== null,
          }),
        );
      }
    });
  };

  return { saved, slots, picking, setPicking, error, setError, jobId, savedOnce, pending, edits, dupes, twinOf, update, save };
}
