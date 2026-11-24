"use client";

import { useState, useTransition } from "react";
import { NOTE_MAX } from "@/lib/game-lists/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// A game's note on a list, edited in a dialog (pick 2D, with the owner's
// change from a popover to a dialog): up to 280 characters with the count
// beside Save. A blank note clears it.
export function NoteDialog({
  target,
  onClose,
  onSave,
}: {
  // The game whose note is open; null when closed.
  target: { gameId: number; title: string; note: string | null } | null;
  onClose: () => void;
  onSave: (gameId: number, note: string) => Promise<string | null>;
}) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {target && <NoteForm key={target.gameId} target={target} onClose={onClose} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}

function NoteForm({
  target,
  onClose,
  onSave,
}: {
  target: { gameId: number; title: string; note: string | null };
  onClose: () => void;
  onSave: (gameId: number, note: string) => Promise<string | null>;
}) {
  const [text, setText] = useState(target.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const over = text.length > NOTE_MAX;
  const save = () =>
    startTransition(async () => {
      const failed = await onSave(target.gameId, text);
      if (failed) setError(failed);
      else onClose();
    });
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!over) save();
      }}
    >
      <DialogHeader>
        <DialogTitle>Note on {target.title}</DialogTitle>
        <DialogDescription>Why it&apos;s here, in a line or two. Members see it under the cover.</DialogDescription>
      </DialogHeader>
      <Textarea
        variant="entry"
        rows={5}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label={`Note on ${target.title}`}
        aria-invalid={over || undefined}
      />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-2">
        <p className="font-label mr-auto text-[0.78rem] font-bold tracking-[0.07em] text-faint-foreground">
          <b className={over ? "text-destructive" : "text-highlight"}>{text.length}</b> / {NOTE_MAX}
        </p>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="highlight" disabled={over || pending}>
          {pending ? "Saving" : "Save"}
        </Button>
      </div>
    </form>
  );
}
