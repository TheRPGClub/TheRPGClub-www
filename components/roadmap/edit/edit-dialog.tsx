"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEditor } from "./editor-context";

// The frame of staff editing's dialogs: open while it is the editor's
// dialog, a form whose submit answers an error to show (the dialog stays
// open, the Roadmap as it was) or null once saved (it closes). `extra` sits
// at the start of the footer (an item's Delete). While any save runs, its
// own or the editor's (that Delete), it can't be closed or saved again.
export function EditDialog({
  title,
  description,
  submitLabel,
  pendingLabel,
  canSubmit = true,
  onSubmit,
  extra,
  children,
}: {
  title: ReactNode;
  description: ReactNode;
  submitLabel: string;
  pendingLabel: string;
  canSubmit?: boolean;
  onSubmit: () => Promise<string | null>;
  extra?: (fail: (error: string | null) => void) => ReactNode;
  children?: ReactNode;
}) {
  const editor = useEditor();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = saving || editor.pending;

  const submit = async () => {
    if (busy || !canSubmit) return;
    setSaving(true);
    setError(null);
    const failed = await onSubmit();
    setSaving(false);
    if (failed) setError(failed);
    else editor.closeDialog();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && editor.closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {children}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {extra?.(setError)}
            <span className="ml-auto flex gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={editor.closeDialog}>
                Cancel
              </Button>
              <Button type="submit" variant="highlight" disabled={busy || !canSubmit}>
                {saving ? pendingLabel : submitLabel}
              </Button>
            </span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
