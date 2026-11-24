"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addGameToListAction,
  deleteGameListAction,
  noteGameAction,
  orderGameListAction,
  removeGameFromListAction,
  updateGameListAction,
} from "@/app/actions/game-lists";
import { moveEntry, placeEntry, reorderEntries, sortEntries } from "@/lib/game-lists/order";
import type { GameList, GameListSort, ListFeedsChallenges } from "@/lib/game-lists/types";

// A Game List page's editor state (pick 2D): the list as last saved, with
// each change applied at once and sent behind. A change that doesn't save
// puts the list back and says so. A delete, or going Private, of a list that
// feeds a Challenge stops at the takeover warning until confirmed.

export type Takeover = { mode: "delete" | "private"; feeds: ListFeedsChallenges };

export function useGameListBoard(initial: GameList) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [takeover, setTakeover] = useState<Takeover | null>(null);
  const [pending, startTransition] = useTransition();
  const entries = sortEntries(list.entries ?? [], list.sort);
  const ranked = sortEntries(list.entries ?? [], "ranked").map((e) => e.game_id);

  // Applies `next` now and sends `save`; on failure the list goes back.
  function change(next: GameList, save: () => Promise<{ ok: boolean; error?: string; feeds?: ListFeedsChallenges }>, onFeeds?: (f: ListFeedsChallenges) => void) {
    const before = list;
    setList(next);
    setError(null);
    startTransition(async () => {
      const result = await save();
      if (result.ok) return;
      setList(before);
      if (result.feeds && onFeeds) onFeeds(result.feeds);
      else setError(result.error ?? "That change didn't save.");
    });
  }

  const reorder = (ids: number[] | null) =>
    ids && change({ ...list, entries: reorderEntries(list.entries ?? [], ids) }, () => orderGameListAction(list.id, ids));

  return {
    list,
    entries,
    error,
    pending,
    takeover,
    dismissError: () => setError(null),
    closeTakeover: () => setTakeover(null),
    move: (gameId: number, step: -1 | 1) => reorder(moveEntry(ranked, gameId, step)),
    place: (gameId: number, before: number | null) => reorder(placeEntry(ranked, gameId, before)),
    setSort: (sort: GameListSort) => change({ ...list, sort }, () => updateGameListAction(list.id, { sort })),
    setPrivate: (on: boolean, confirm = false) =>
      change(
        { ...list, visibility: on ? "private" : "members" },
        () => updateGameListAction(list.id, { visibility: on ? "private" : "members" }, confirm),
        (feeds) => setTakeover({ mode: "private", feeds }),
      ),
    note: async (gameId: number, note: string): Promise<string | null> => {
      const result = await noteGameAction(list.id, gameId, note);
      if (!result.ok || !result.data) return result.error ?? "The note didn't save.";
      const saved = result.data;
      setList((l) => ({ ...l, entries: (l.entries ?? []).map((e) => (e.game_id === gameId ? { ...e, note: saved.note } : e)) }));
      return null;
    },
    remove: (gameId: number) =>
      change(
        { ...list, entry_count: list.entry_count - 1, entries: reorderEntries(list.entries ?? [], ranked.filter((id) => id !== gameId)) },
        () => removeGameFromListAction(list.id, gameId),
      ),
    add: async (gameId: number): Promise<string | null> => {
      const result = await addGameToListAction(list.id, gameId);
      if (!result.ok || !result.data) return result.error ?? "That game didn't go in.";
      const entry = result.data;
      setList((l) => ({ ...l, entry_count: l.entry_count + 1, entries: [...(l.entries ?? []), entry], updated_at: entry.added_at }));
      return null;
    },
    // Null once deleted (the page moves to /lists); the error otherwise.
    destroy: async (confirm = false): Promise<string | null> => {
      const result = await deleteGameListAction(list.id, confirm);
      if (result.feeds) {
        setTakeover({ mode: "delete", feeds: result.feeds });
        return null;
      }
      if (!result.ok) return result.error ?? "The list wasn't deleted.";
      router.push("/lists");
      return null;
    },
  };
}

export type GameListBoard = ReturnType<typeof useGameListBoard>;
