"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { JournalEntry } from "@/lib/api/types";
import { journalDate } from "@/lib/journals";
import { deleteJournalEntryAction } from "@/app/actions/journals";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { JournalEntryView } from "@/components/journal/journal-entry";
import {
  JournalEntryEditor,
  type JournalEditorGame,
} from "@/components/journal/journal-entry-editor";
import { Button } from "@/components/ui/button";

const OWN_BUTTON = "h-[26px] px-2 text-[0.8rem]";

// An entry its author is reading: Edit opens the editor in place, Delete
// asks first.
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
  const [editing, setEditing] = useState(false);
  const name = number != null ? `entry ${number}` : "this entry";

  if (editing) {
    return (
      <JournalEntryEditor
        userId={entry.user_id}
        entryId={entry.entry_id}
        game={game}
        chapterGameId={game.game_id}
        initialTitle={entry.entry_title ?? ""}
        initialBody={entry.entry_body}
        label={`Editing ${number != null ? `entry ${number}` : "entry"} · ${journalDate(entry.created_at, true) ?? ""}`}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
        autoFocus
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <JournalEntryView
        entry={entry}
        number={number}
        clamp={clamp}
        actions={
          <>
            <Button variant="tool" className={OWN_BUTTON} onClick={() => setEditing(true)}>
              <Pencil aria-hidden />
              Edit
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="tool" className={OWN_BUTTON}>
                  <Trash2 aria-hidden className="text-destructive" />
                  Delete
                </Button>
              }
              title={`Delete ${name}?`}
              description="It can't be brought back."
              confirmLabel="Delete"
              pendingLabel="Deleting"
              confirmIcon={<Trash2 aria-hidden />}
              onConfirm={async () => {
                const res = await deleteJournalEntryAction({
                  entryId: entry.entry_id,
                  userId: entry.user_id,
                  gameId: entry.gamedb_game_id,
                });
                return res.ok ? null : (res.error ?? "Couldn't delete it. Try again.");
              }}
            />
          </>
        }
      />
    </div>
  );
}
