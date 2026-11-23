"use client";

import { Lock, Pencil, Trash2, Undo2, X, Check } from "lucide-react";
import type { ReleaseRow as Row } from "@/lib/games/game-edit/release-rows";
import { isPast, machineDate, precisionNote, regionTone, releaseDateLabel } from "@/lib/releases";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StagedMark } from "@/components/games/edit/edit-section";
import { cn } from "@/lib/utils";

// One Release in the Releases tab (design www#156 round 3): its region and
// date at its Date Precision, its format and notes, where it came from, and
// for a Manual Release the pencil and bin (a staged one says so, with an
// Undo). An IGDB Release is locked. An open row holds its editor.
export function ReleaseRow({
  row,
  today,
  editor,
  onEdit,
  onDelete,
  onUndo,
}: {
  row: Row;
  today: string;
  // The open editor, which takes the row's place.
  editor?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onUndo: () => void;
}) {
  const { draft, state } = row;
  const label = releaseDateLabel(draft.release_date, draft.date_precision);
  const note = precisionNote(draft.date_precision);
  const past = isPast(draft.release_date, draft.date_precision, today);
  const removing = state === "deleting";
  const facts = [draft.format, draft.notes].filter(Boolean).join(" · ");

  if (editor) {
    return (
      <li className="my-1 flex items-start gap-2 rounded-sm p-2 shadow-[inset_0_0_0_1.5px_var(--color-highlight)]">
        <div className="min-w-0 flex-1">{editor}</div>
        {state === "added" && <StagedMark kind="added">Added</StagedMark>}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={state === "added" ? "Remove this new Release" : "Done editing"}
          onClick={state === "added" ? onDelete : onEdit}
        >
          {state === "added" ? <X /> : <Check />}
        </Button>
      </li>
    );
  }

  return (
    <li className="grid min-h-10 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-border py-1 first:border-t-0 sm:grid-cols-[minmax(13rem,auto)_minmax(0,1fr)_5.5rem_auto]">
      <div className={cn("flex flex-wrap items-center gap-1.5 text-sm", past && "text-faint-foreground")}>
        <Badge tone={regionTone(draft.region_code)} past={past} className="min-w-[30px]" title={draft.region_name}>
          {draft.region_code}
        </Badge>
        {label && draft.release_date && (
          <time dateTime={machineDate(draft.release_date, draft.date_precision)} className={cn("font-semibold", removing && "line-through decoration-destructive")}>
            {label}
          </time>
        )}
        {note && <Badge tone="precision">{note}</Badge>}
        {state === "edited" && <StagedMark kind="edited">Edited</StagedMark>}
        {removing && <StagedMark kind="removing">Deleting</StagedMark>}
      </div>
      <span className={cn("col-start-1 truncate text-[0.84rem] text-faint-foreground sm:col-start-auto", removing && "line-through")}>
        {facts}
      </span>
      <span className="font-label hidden items-center gap-1.5 text-[0.74rem] font-bold tracking-[0.08em] text-faint-foreground sm:inline-flex">
        {row.source === "igdb" ? <Lock aria-hidden className="size-3" /> : <Pencil aria-hidden className="size-3" />}
        {row.source === "igdb" ? "IGDB" : "Manual"}
      </span>
      <div className="col-start-2 row-span-2 row-start-1 flex items-center justify-end gap-0.5 sm:col-start-auto sm:row-span-1">
        {row.source === "igdb" ? (
          <span className="sr-only">Read-only: IGDB owns this Release</span>
        ) : removing || state === "edited" ? (
          <Button variant="inline-link" size="inline" onClick={onUndo} className="gap-1 text-[0.8rem]">
            <Undo2 aria-hidden className="mr-1 inline size-3.5" />
            Undo
          </Button>
        ) : null}
        {row.source === "manual" && !removing && (
          <>
            <Button variant="tool" size="icon-sm" aria-label="Edit this Release" onClick={onEdit}>
              <Pencil />
            </Button>
            <Button variant="destructive-ghost" size="icon-sm" aria-label="Delete this Release" onClick={onDelete}>
              <Trash2 />
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
