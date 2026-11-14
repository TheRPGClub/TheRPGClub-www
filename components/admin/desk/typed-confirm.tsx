"use client";

import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useTypedConfirm, type TypedConfirmResult } from "@/hooks/use-typed-confirm";
import { TypedConfirmField } from "@/components/admin/desk/typed-confirm-field";
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
import { Button } from "@/components/ui/button";

export type { TypedConfirmResult };

export interface TypedConfirmProps {
  // The button that opens the confirm, e.g. "Reset GOTM votes".
  triggerLabel: string;
  triggerIcon?: LucideIcon;
  size?: "sm" | "default";
  // The confirm's title, e.g. "Delete all 31 GOTM votes for Round 143?"
  question: ReactNode;
  // What happens, before "Type WORDS to go ahead."
  children?: ReactNode;
  // The words to type, e.g. "RESET GOTM". Matched ignoring case and extra
  // spaces.
  words: string;
  // The confirm button, e.g. "Reset".
  actionLabel: string;
  actionIcon?: LucideIcon;
  onConfirm: () => Promise<TypedConfirmResult> | TypedConfirmResult;
}

// A destructive action that only goes ahead once the words shown are typed:
// the orange outline button opens an alert dialog (the shared ConfirmDialog
// pattern) with the words to type, and its solid orange action stays off
// until they match. Enter in the field confirms too. A refused action keeps
// the dialog open with the reason; one that went through closes it.
export function TypedConfirmButton({
  triggerLabel,
  triggerIcon: TriggerIcon,
  size = "sm",
  question,
  children,
  words,
  actionLabel,
  actionIcon: ActionIcon,
  onConfirm,
}: TypedConfirmProps) {
  const id = useId();
  const c = useTypedConfirm(words, onConfirm);
  return (
    <AlertDialog open={c.open} onOpenChange={c.onOpenChange}>
      <AlertDialogTrigger render={<Button type="button" variant="destructive-outline" size={size} />}>
        {TriggerIcon && <TriggerIcon data-icon="inline-start" />}
        {triggerLabel}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{question}</AlertDialogTitle>
          <AlertDialogDescription id={`${id}-how`}>
            {children}
            {children ? " " : null}
            Type <b className="font-semibold text-foreground">{words}</b> to go ahead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <TypedConfirmField id={id} words={words} confirm={c} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={c.pending}>Keep it</AlertDialogCancel>
          <AlertDialogAction variant="destructive-solid" disabled={!c.ready || c.pending} onClick={c.confirm}>
            {ActionIcon && <ActionIcon data-icon="inline-start" />}
            {c.pending ? "Working..." : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
