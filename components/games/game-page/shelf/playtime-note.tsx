"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const PLAYTIME_NOTE_MAX = 280;

// A Manual entry's note ("From my save file"), edited under its row. A
// blank note clears it.
export function PlaytimeNote({
  initial,
  pending,
  onSave,
  onCancel,
}: {
  initial: string;
  pending: boolean;
  onSave: (note: string | null) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const [text, setText] = useState(initial);
  return (
    <form
      className="mt-1.5 flex flex-wrap items-center gap-2 rounded-[3px] bg-muted px-3 py-2.5 inset-ring-1 inset-ring-highlight"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(text.trim() ? text.trim() : null);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Note
      </label>
      <Input id={id} autoFocus maxLength={PLAYTIME_NOTE_MAX} placeholder="Where the time came from" value={text} onChange={(e) => setText(e.target.value)} className="h-8 min-w-0 flex-1" />
      <span className="ml-auto flex gap-1.5">
        <Button type="button" variant="ghost" size="xs" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" variant="highlight" size="xs" disabled={pending}>
          Save
        </Button>
      </span>
    </form>
  );
}
