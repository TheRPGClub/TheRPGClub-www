"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import {
  JournalEntryEditor,
  type JournalEditorGame,
} from "@/components/journal/journal-entry-editor";
import { Button } from "@/components/ui/button";

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
