"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

// A destructive question asked in place on the score line (Delete Revision
// 2?, Discard this draft?, Delete this review?): what goes, then the
// confirmed action in signal orange and the way back.
export function TakeConfirm({
  title,
  note,
  confirmLabel,
  keepLabel = "Keep it",
  pending,
  error,
  onConfirm,
  onKeep,
}: {
  title: string;
  note: string;
  confirmLabel: string;
  keepLabel?: string;
  pending: boolean;
  error?: string | null;
  onConfirm: () => void;
  onKeep: () => void;
}) {
  return (
    <div
      role="alertdialog"
      aria-label={title}
      className="rounded-[3px] border border-destructive bg-destructive/8 px-4 py-3.5"
    >
      <p className="font-headline m-0 text-[1.3rem] leading-none">{title}</p>
      <p className="mt-1.5 mb-3 text-[0.9rem] text-dim-foreground">{`${note} This can't be undone.`}</p>
      {error && (
        <p role="alert" className="mt-0 mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="destructive-solid" size="sm" onClick={onConfirm} disabled={pending}>
          <Trash2 />
          {confirmLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onKeep} disabled={pending} autoFocus>
          {keepLabel}
        </Button>
      </div>
    </div>
  );
}
