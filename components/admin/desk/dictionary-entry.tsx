"use client";

import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One dictionary entry: the headword in bold, the other forms in italics,
// and its edit and delete tools. While its delete is held it is struck
// through over the Undo bar; a refused delete shows the reason.
export function DictionaryEntry({
  word,
  others,
  alsoLabel,
  held,
  error,
  onEdit,
  onDelete,
  undo,
}: {
  word: string;
  others: readonly string[];
  alsoLabel: string;
  held: boolean;
  error?: string | null;
  onEdit?: () => void;
  onDelete: () => void;
  // The Undo bar, shown while held.
  undo: ReactNode;
}) {
  const struck = held && "text-faint-foreground line-through decoration-destructive";
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-border py-2.5">
      <span className={cn("text-[1.05rem] font-bold break-words", struck)}>{word}</span>
      {others.length > 0 && (
        <span className={cn("col-start-1 text-[0.93rem] break-words text-dim-foreground italic", struck)}>
          <b className="font-label mr-1.5 text-[0.72rem] tracking-[0.08em] text-faint-foreground not-italic">
            {alsoLabel}
          </b>
          {others.join(", ")}
        </span>
      )}
      {!held && (
        <span className="col-start-2 row-span-2 row-start-1 flex gap-0.5 self-center">
          {onEdit && (
            <Button type="button" variant="row" size="icon-sm" onClick={onEdit} aria-label={`Edit ${word}`} title="Edit">
              <Pencil />
            </Button>
          )}
          <Button
            type="button"
            variant="destructive-row"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete ${word}`}
            title="Delete"
          >
            <Trash2 />
          </Button>
        </span>
      )}
      {held && undo}
      {error && (
        <p role="alert" className="col-span-2 mt-1 text-sm text-destructive">
          {"Couldn't delete it: "}
          {error}
        </p>
      )}
    </li>
  );
}
