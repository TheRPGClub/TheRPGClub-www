"use client";

import { useState, useTransition } from "react";
import { PenLine, Pencil, Trash2 } from "lucide-react";
import type { JournalEntry } from "@/lib/api/types";
import { journalDate } from "@/lib/journals";
import { deleteJournalEntryAction } from "@/app/actions/journals";
import { JournalEntryView } from "@/components/journal/journal-entry";
import {
  JournalEntryEditor,
  type JournalEditorGame,
} from "@/components/journal/journal-entry-editor";
import { Button } from "@/components/ui/button";

const OWN_BUTTON =
  "h-[26px] px-2 text-[0.8rem] text-faint-foreground hover:bg-muted hover:text-foreground";

// An entry its author is reading: Edit opens the editor in place, Delete
// asks first, inline.
export function JournalOwnerEntry({
  entry,
  number,
  game,
  clamp,
  className,
}: {
  entry: JournalEntry;
  number: number | null;
  game: JournalEditorGame;
  clamp?: 2 | 3;
  className?: string;
}) {
  const [mode, setMode] = useState<"read" | "edit" | "confirm">("read");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const name = number != null ? `entry ${number}` : "this entry";

  if (mode === "edit") {
    return (
      <JournalEntryEditor
        userId={entry.user_id}
        entryId={entry.entry_id}
        game={game}
        chapterGameId={game.game_id}
        initialTitle={entry.entry_title ?? ""}
        initialBody={entry.entry_body}
        label={`Editing ${number != null ? `entry ${number}` : "entry"} · ${journalDate(entry.created_at, true) ?? ""}`}
        onCancel={() => setMode("read")}
        onSaved={() => setMode("read")}
        autoFocus
        className={className}
      />
    );
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const res = await deleteJournalEntryAction({
        entryId: entry.entry_id,
        userId: entry.user_id,
        gameId: entry.gamedb_game_id,
      });
      if (!res.ok) {
        setError(res.error ?? "Couldn't delete it. Try again.");
        return;
      }
    });
  }

  return (
    <div className={className}>
      <JournalEntryView
        entry={entry}
        number={number}
        clamp={mode === "read" ? clamp : undefined}
        actions={
          mode === "read" && (
            <>
              <Button variant="ghost" className={OWN_BUTTON} onClick={() => setMode("edit")}>
                <Pencil aria-hidden />
                Edit
              </Button>
              <Button
                variant="ghost"
                className={OWN_BUTTON}
                onClick={() => setMode("confirm")}
              >
                <Trash2 aria-hidden className="text-destructive" />
                Delete
              </Button>
            </>
          )
        }
      />
      {mode === "confirm" && (
        <div
          role="group"
          aria-label="Confirm delete"
          className="mt-2 flex flex-wrap items-center gap-2.5 rounded-md bg-background px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-destructive)]"
        >
          <span className="mr-auto text-[0.9rem] text-foreground">
            Delete {name}? It can&apos;t be brought back.
          </span>
          <Button variant="destructive" size="sm" onClick={remove} disabled={pending}>
            <Trash2 aria-hidden />
            {pending ? "Deleting" : "Delete"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode("read");
              setError(null);
            }}
            disabled={pending}
          >
            Keep it
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// The owner's next entry at the top of a chapter: open on arrival, and back
// to a single button once cancelled.
export function JournalCompose({
  userId,
  game,
  chapterGameId,
  label,
  startOpen = true,
}: {
  userId: string;
  game: JournalEditorGame | null;
  chapterGameId: number | null;
  label: string;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  if (!open) {
    return (
      <div>
        <Button variant="highlight" onClick={() => setOpen(true)}>
          <PenLine aria-hidden />
          Write {label.split(" · ")[0].toLowerCase()}
        </Button>
      </div>
    );
  }
  return (
    <JournalEntryEditor
      userId={userId}
      game={game}
      chapterGameId={chapterGameId}
      label={label}
      onCancel={() => setOpen(false)}
    />
  );
}
