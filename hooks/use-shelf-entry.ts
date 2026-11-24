"use client";

import { useState } from "react";

import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import { clubToday, type IsoDay } from "@/lib/shelf-forms/dates";
import {
  shelfPayload,
  shelfProblems,
  shelfStart,
  type ShelfValues,
  type SimpleShelfEntry,
  type SimpleShelfKind,
} from "@/lib/shelf-forms/values";
import { useShelfSave, type ShelfSaved } from "./use-shelf-save";

export interface ShelfEntryInput {
  kind: SimpleShelfKind;
  userId: string;
  game: { game_id: number };
  // The entry to edit; none adds the game to the list.
  entry?: SimpleShelfEntry | null;
  // The club's today; defaults to now.
  today?: IsoDay;
  onSaved: (saved: ShelfSaved) => void;
}

/**
 * A Now Playing, Backlog, Favorites or Collection form (spec api#451): its
 * values from the entry it edits (or a new entry's defaults), the Started
 * day's problem (Now Playing), and the save.
 */
export function useShelfEntry({ kind, userId, game, entry, today: todayProp, onSaved }: ShelfEntryInput) {
  const [today] = useState(() => todayProp ?? clubToday());
  const [values, setValues] = useState<ShelfValues>(() => shelfStart(entry, today));
  const entryId = entry ? (resolveEntryId(kind, entry) ?? null) : null;
  const saver = useShelfSave(userId, kind, entryId, onSaved);

  const set = <K extends keyof ShelfValues>(key: K, value: ShelfValues[K]) => {
    saver.clearRefusal();
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const problems = { ...shelfProblems(kind, values, today) };
  const refusal = saver.refusal;
  if (refusal?.field === "started") problems.started ??= refusal.message;

  const submit = () => {
    if (problems.started) return;
    saver.save(shelfPayload(kind, game.game_id, values, entry));
  };

  return {
    values,
    set,
    problems,
    formError: refusal && refusal.field !== "started" ? refusal.message : null,
    today,
    editing: entry != null,
    pending: saver.pending,
    submit,
  };
}
