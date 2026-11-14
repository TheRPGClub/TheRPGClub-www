"use client";

import { useState, useTransition, type ReactElement, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Asks before something that can't be undone (revoke a key, delete an
// entry): `trigger` opens it, the destructive action runs `onConfirm`, which
// answers with an error to show in place (the dialog stays open) or null once
// it is done (the dialog closes). Keep it closes without doing anything.
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmIcon,
  onConfirm,
}: {
  // The Button that opens the dialog.
  trigger: ReactElement;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  confirmIcon?: ReactNode;
  onConfirm: () => Promise<string | null>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const failed = await onConfirm();
      if (failed) setError(failed);
      else setOpen(false);
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return;
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive-solid" onClick={confirm} disabled={pending}>
            {confirmIcon}
            {pending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
