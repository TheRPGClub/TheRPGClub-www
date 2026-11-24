"use client";

import type { ShelfSaved } from "@/hooks/use-shelf-save";
import type { Platform } from "@/lib/api/types";
import type { GameShelf, ShelfList } from "@/lib/games/shelf";
import type { SimpleShelfEntry, SimpleShelfKind } from "@/lib/shelf-forms/values";
import { CompletionDialog } from "@/components/member/shelf-forms/completion-dialog";
import type { ShelfGame } from "@/components/member/shelf-forms/shelf-entry-form";
import { ShelfFormDialog } from "@/components/member/shelf-forms/shelf-form-dialog";

// The entry a simple list's form edits, or null to add the game.
export function shelfEntry(shelf: GameShelf, kind: SimpleShelfKind): SimpleShelfEntry | null {
  switch (kind) {
    case "now_playing":
      return shelf.nowPlaying;
    case "backlog":
      return shelf.backlog;
    case "favorite":
      return shelf.favorite?.entry ?? null;
    case "collection":
      return shelf.collection;
  }
}

// The shared forms from www#174, mounted for the game page: the Game
// Completion dialog (logging a new one, Started from Now Playing), or one
// list's form adding the game or editing its entry, with Remove when editing.
export function ShelfFormsHost({
  open,
  onClose,
  userId,
  game,
  shelf,
  platforms,
  onSaved,
  onRemove,
}: {
  open: ShelfList | null;
  onClose: () => void;
  userId: string;
  game: ShelfGame;
  shelf: GameShelf;
  platforms: Platform[];
  onSaved: (saved: ShelfSaved) => void;
  onRemove: (kind: SimpleShelfKind, entry: SimpleShelfEntry) => void;
}) {
  const onOpenChange = (next: boolean) => {
    if (!next) onClose();
  };
  if (open === "completed") {
    return (
      <CompletionDialog
        open
        onOpenChange={onOpenChange}
        userId={userId}
        game={game}
        completions={shelf.completions}
        nowPlaying={shelf.nowPlaying}
        platforms={platforms}
        onSaved={onSaved}
      />
    );
  }
  if (!open) return null;
  const entry = shelfEntry(shelf, open);
  return (
    <ShelfFormDialog
      key={open}
      open
      onOpenChange={onOpenChange}
      kind={open}
      userId={userId}
      game={game}
      entry={entry}
      platforms={platforms}
      onSaved={onSaved}
      onRemove={entry ? () => onRemove(open, entry) : undefined}
    />
  );
}
