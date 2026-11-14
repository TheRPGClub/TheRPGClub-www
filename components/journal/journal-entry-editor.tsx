"use client";

import { useState } from "react";
import type { GameSummary } from "@/lib/api/types";
import { useJournalEntrySave } from "@/hooks/use-journal-entry-save";
import { EntryGameChip, EntryGamePicker } from "@/components/journal/journal-entry-game";
import { JournalEntryActions, JournalEntryFields } from "@/components/journal/journal-entry-fields";
import { cn } from "@/lib/utils";

export type JournalEditorGame = Pick<GameSummary, "game_id" | "title" | "cover_url">;

// The owner's editor, open for their own edits (the yellow edge): optional
// title, the entry, and the game it files under. Writes the next entry, or
// rewrites one in place. A save that files the entry under another game opens
// that game's chapter.
export function JournalEntryEditor({
  userId,
  entryId,
  game: initialGame,
  chapterGameId,
  initialTitle = "",
  initialBody = "",
  label,
  onCancel,
  onSaved,
  autoFocus,
  className,
}: {
  userId: string;
  // Set when rewriting an entry; absent for the next one.
  entryId?: number;
  game: JournalEditorGame | null;
  // The chapter the editor sits in, if any: saving elsewhere navigates.
  chapterGameId?: number | null;
  initialTitle?: string;
  initialBody?: string;
  label: string;
  onCancel?: () => void;
  onSaved?: () => void;
  autoFocus?: boolean;
  className?: string;
}) {
  const [game, setGame] = useState<JournalEditorGame | null>(initialGame);
  const [picking, setPicking] = useState(initialGame === null);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const { error, setError, pending, save } = useJournalEntrySave({
    userId,
    entryId,
    previousGameId: initialGame?.game_id,
    chapterGameId,
    onSaved,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save(game?.game_id ?? null, title, body, () => {
          setTitle("");
          setBody("");
        });
      }}
      noValidate
      aria-label={entryId ? "Edit entry" : "Write an entry"}
      className={cn(
        "rounded-md bg-card px-4 py-3.5 shadow-[inset_0_0_0_1.5px_var(--color-highlight)] sm:px-4.5",
        className,
      )}
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
        <span className="font-label text-[0.88rem] text-highlight">{label}</span>
        {game && !picking && <EntryGameChip game={game} disabled={pending} onChange={() => setPicking(true)} />}
      </div>

      {picking && (
        <EntryGamePicker
          autoFocus={initialGame !== null}
          keepTitle={initialGame ? (game?.title ?? initialGame.title) : null}
          onPick={(picked) => {
            setGame({ game_id: picked.game_id, title: picked.title, cover_url: picked.cover_url });
            setPicking(false);
            setError(null);
          }}
          onKeep={() => setPicking(false)}
        />
      )}

      <JournalEntryFields
        title={title}
        body={body}
        onTitle={(next) => {
          setTitle(next);
          setError(null);
        }}
        onBody={(next) => {
          setBody(next);
          setError(null);
        }}
        disabled={pending}
        autoFocus={autoFocus}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <JournalEntryActions
        pending={pending}
        onCancel={onCancel}
        titleLength={title.length}
        bodyLength={body.length}
      />
    </form>
  );
}
