"use client";

import { useState } from "react";

import type { GameCompletion, UserNowPlaying } from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import type { IsoDay } from "@/lib/shelf-forms/dates";
import {
  completionPayload,
  completionProblems,
  completionStart,
  type CompletionProblems,
  type CompletionValues,
} from "@/lib/shelf-forms/values";
import { useShelfSave, type ShelfSaved } from "./use-shelf-save";

/**
 * The Game Completion form (spec api#451): its values, filled from the
 * completion it edits or from the member's Now Playing entry, the problems
 * it shows, and the save. Date problems show as soon as they arise; the
 * rest once Log it is pressed.
 */
export function useCompletionLog(input: {
  userId: string;
  gameId: number;
  entry?: GameCompletion | null;
  nowPlaying?: UserNowPlaying | null;
  // The open Playthrough's minutes: a new completion's hours start there.
  playthroughMinutes?: number | null;
  today: IsoDay;
  onSaved: (saved: ShelfSaved) => void;
}) {
  const { userId, gameId, entry, nowPlaying, playthroughMinutes, today } = input;
  const [start] = useState(() => completionStart({ entry, nowPlaying, playthroughMinutes, today }));
  const [values, setValues] = useState<CompletionValues>(start.values);
  const [tried, setTried] = useState(false);
  const entryId = entry ? (resolveEntryId("completed", entry) ?? null) : null;
  const saver = useShelfSave(userId, "completed", entryId, input.onSaved);

  const set = <K extends keyof CompletionValues>(key: K, value: CompletionValues[K]) => {
    saver.clearRefusal();
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const found = completionProblems(values, today);
  const problems: CompletionProblems = {
    started: found.started,
    finished: found.finished,
    ...(tried ? { playtime: found.playtime, note: found.note } : {}),
  };
  const refusal = saver.refusal;
  if (refusal?.field) problems[refusal.field] ??= refusal.message;

  const submit = () => {
    setTried(true);
    if (Object.values(found).some(Boolean)) return;
    saver.save(completionPayload(gameId, values, { original: entry ?? null, onNowPlaying: nowPlaying != null }));
  };

  return {
    values,
    set,
    problems,
    // A refusal that belongs to no field, for the slip's foot.
    formError: refusal && !refusal.field ? refusal.message : null,
    startedFromNowPlaying: start.startedFromNowPlaying && values.started === start.values.started,
    onNowPlaying: nowPlaying != null && entry == null,
    editing: entry != null,
    pending: saver.pending,
    submit,
  };
}

export type CompletionLog = ReturnType<typeof useCompletionLog>;
