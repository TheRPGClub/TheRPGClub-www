"use client";

import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { Platform } from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/member-shelf-entry";
import type { GameShelf, ShelfList, ShelfMode } from "@/lib/games/shelf";
import type { SimpleShelfEntry, SimpleShelfKind } from "@/lib/shelf-forms/values";
import { CompletionDialog } from "@/components/member/shelf-forms/completion-dialog";
import type { ShelfGame } from "@/components/member/shelf-forms/shelf-entry-form";
import { ShelfFormDialog } from "@/components/member/shelf-forms/shelf-form-dialog";

// What the game page has open: the Game Completion dialog logging a new one
// or editing one (`entryId`), or one list's form adding the game (no
// `entryId` on Backlog / Collection, which may hold it again) or editing its
// entry.
export interface ShelfOpen {
  list: ShelfList;
  mode: ShelfMode;
  entryId?: number;
}

// The entry a simple list's form edits, or null to add the game. Backlog and
// Collection name theirs by id; Now Playing and Favorites hold one.
export function shelfEntry(shelf: GameShelf, kind: SimpleShelfKind, entryId?: number): SimpleShelfEntry | null {
  switch (kind) {
    case "now_playing":
      return shelf.nowPlaying;
    case "favorite":
      return shelf.favorite?.entry ?? null;
    case "backlog":
    case "collection": {
      if (entryId == null) return null;
      const entries: SimpleShelfEntry[] = shelf[kind];
      return entries.find((e) => resolveEntryId(kind, e) === entryId) ?? null;
    }
  }
}

// The shared forms from www#174, mounted for the game page: the Game
// Completion dialog (logging a new one, Started from Now Playing, or editing
// an earlier one picked from the menu or the dialog's timeline), or one
// list's form adding the game or editing its entry. Remove when editing.
export function ShelfFormsHost({
  open,
  onClose,
  userId,
  game,
  shelf,
  platforms,
  onSaved,
  onRemove,
  onPickCompletion,
}: {
  open: ShelfOpen | null;
  onClose: () => void;
  userId: string;
  game: ShelfGame;
  shelf: GameShelf;
  platforms: Platform[];
  onSaved: (saved: ShelfSaved) => void;
  onRemove: (list: ShelfList, entryId: number) => void;
  // Switch the open dialog to another of the member's Game Completions.
  onPickCompletion: (completionId: number) => void;
}) {
  const onOpenChange = (next: boolean) => {
    if (!next) onClose();
  };
  if (open?.list === "completed") {
    const entry = open.mode === "edit" ? (shelf.completions.find((c) => c.completion_id === open.entryId) ?? null) : null;
    return (
      <CompletionDialog
        // A fresh form for each completion opened.
        key={entry?.completion_id ?? "log"}
        open
        onOpenChange={onOpenChange}
        userId={userId}
        game={game}
        completions={shelf.completions}
        nowPlaying={entry ? null : shelf.nowPlaying}
        entry={entry}
        platforms={platforms}
        onSaved={onSaved}
        onRemove={entry ? () => onRemove("completed", entry.completion_id) : undefined}
        onPick={onPickCompletion}
      />
    );
  }
  if (!open) return null;
  const kind = open.list;
  const entry = open.mode === "edit" ? shelfEntry(shelf, kind, open.entryId) : null;
  return (
    <ShelfFormDialog
      key={`${kind}:${open.entryId ?? open.mode}`}
      open
      onOpenChange={onOpenChange}
      kind={kind}
      userId={userId}
      game={game}
      entry={entry}
      platforms={platforms}
      onSaved={onSaved}
      onRemove={entry ? () => onRemove(kind, resolveEntryId(kind, entry)!) : undefined}
    />
  );
}
