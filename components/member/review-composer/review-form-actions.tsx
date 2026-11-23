"use client";

import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";

// The review form's footer: delete on the left (when offered), then the move
// to the full editor, cancel, and the save.
export function ReviewFormActions({
  editing,
  pending,
  rated,
  onDelete,
  onTransfer,
  transferNeedsScore = true,
  onCancel,
}: {
  // Whether this is a saved review being edited rather than a new one.
  editing: boolean;
  pending: boolean;
  // Whether a rating is set: nothing posts without one.
  rated: boolean;
  onDelete?: () => void;
  onTransfer?: () => void;
  // A new review moves to the full editor as a Draft, which needs no score.
  transferNeedsScore?: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
      {onDelete ? (
        <Button type="button" variant="destructive" size="sm" onClick={onDelete} disabled={pending}>
          Delete
        </Button>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onTransfer && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onTransfer}
            disabled={pending || (transferNeedsScore && !rated)}
          >
            <Maximize2 />
            Open full review editor
          </Button>
        )}
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="highlight" size="sm" disabled={pending || !rated}>
          {editing ? "Save changes" : "Post review"}
        </Button>
      </div>
    </div>
  );
}
