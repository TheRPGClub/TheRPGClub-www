"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { editRuleDate } from "@/lib/reviews/edit-rules";
import { cn } from "@/lib/utils";
import { DeskStrip, TRACK_INK } from "./desk-strip";

// The strip along the desk's foot while a Published Review is edited. No
// autosave and no pencil: the register square is solid in the track's ink,
// and nothing changes for readers until Save changes. Delete review turns
// the strip into its question, as a Draft's Discard does.
export function EditStrip({
  accent,
  publishedAt,
  pending,
  rated,
  onCancel,
  onDelete,
  revision,
  deleteNote = "Every member loses it, score and all.",
}: {
  accent: ReviewAccent;
  publishedAt?: string | null;
  pending: boolean;
  // Save changes needs a score: a Published Review always keeps one.
  rated: boolean;
  onCancel?: () => void;
  onDelete: () => void;
  // Editing a Published Revision: Delete takes only it, and says where the
  // score goes ("Its take and scorecard go. The score goes back to 85.").
  revision?: { deleteNote: string } | null;
  // Editing the Review's first take: what deleting the whole Review takes
  // with it (its Revisions too, on a revisited Review).
  deleteNote?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <DeskStrip accent={accent} alarm={confirming}>
      {confirming ? (
        <div role="alertdialog" aria-label={revision ? "Delete this revision?" : "Delete this review?"} className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5">
          <p className="m-0 flex-[1_1_100%] text-[0.94rem] text-dim-foreground sm:flex-1">
            <b className="font-semibold text-destructive">
              {revision ? "Delete this revision?" : "Delete this review?"}
            </b>{" "}
            {revision ? revision.deleteNote : deleteNote} This can&apos;t be undone.
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending} autoFocus>
            Keep it
          </Button>
          <Button type="button" variant="destructive-solid" size="sm" onClick={onDelete} disabled={pending}>
            <Trash2 />
            {revision ? "Delete revision" : "Delete review"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-3.5 py-2.5">
          <span className="font-label flex min-w-0 items-center gap-2 text-[0.8rem] font-extrabold tracking-[0.07em] whitespace-nowrap uppercase">
            <span aria-hidden className={cn("size-3 shrink-0", TRACK_INK[accent])} />
            Editing
            {publishedAt && (
              <span className="truncate font-bold tracking-[0.06em] text-faint-foreground">
                · published {editRuleDate(publishedAt)}
              </span>
            )}
          </span>
          <span className="font-label hidden text-[0.72rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase lg:inline">
            changes go live when you save
          </span>
          <span className="flex-1" />
          <span className="ml-auto flex items-center gap-2 sm:ml-0">
            <Button type="button" variant="destructive-ghost" size="sm" onClick={() => setConfirming(true)} disabled={pending}>
              <Trash2 />
              Delete<span className="hidden sm:inline">{revision ? "revision" : "review"}</span>
            </Button>
            <span aria-hidden className="hidden w-px self-stretch bg-border-strong sm:block" />
            {onCancel && (
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="highlight" disabled={pending || !rated}>
              Save changes
            </Button>
          </span>
        </div>
      )}
    </DeskStrip>
  );
}
