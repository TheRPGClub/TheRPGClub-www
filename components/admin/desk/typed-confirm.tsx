"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Scissors } from "lucide-react";
import { typedWordsMatch } from "@/lib/desk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// What the guarded action answers: an error to show, or nothing when it
// went through (the confirm then closes).
export type TypedConfirmResult = { error?: string | null } | void;

export interface TypedConfirmProps {
  // The cut label on the dashed border, e.g. "Reset GOTM votes".
  label: string;
  // The question in bold, e.g. "Delete all 31 GOTM ballots for Round 143?"
  question: ReactNode;
  // What happens, before "Type WORDS to go ahead."
  children?: ReactNode;
  // The words to type, shown in paper, e.g. "RESET GOTM". Matched ignoring
  // case and extra spaces.
  words: string;
  // The confirm button, e.g. "Reset".
  actionLabel: string;
  actionIcon?: LucideIcon;
  icon?: LucideIcon;
  onConfirm: () => Promise<TypedConfirmResult> | TypedConfirmResult;
  // Shows a Cancel button.
  onCancel?: () => void;
  className?: string;
}

// A destructive action that only goes ahead once the words shown are typed:
// a dashed signal-orange box with its label cut into the border, the words
// to type, and the solid orange button that stays off until they match.
// Enter in the field confirms too. Not a <form>, so it can sit inside one.
export function TypedConfirm({
  label,
  question,
  children,
  words,
  actionLabel,
  actionIcon: ActionIcon,
  icon: Icon = Scissors,
  onConfirm,
  onCancel,
  className,
}: TypedConfirmProps) {
  const id = useId();
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = typedWordsMatch(typed, words);

  const confirm = () => {
    if (!ready || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await onConfirm();
        if (result && result.error) setError(result.error);
      } catch {
        setError("Couldn't reach the club's server. Try again.");
      }
    });
  };

  return (
    <fieldset
      className={cn(
        "min-w-0 rounded-md border-[1.5px] border-dashed border-destructive bg-destructive/[0.04] px-3.5 pt-1 pb-3.5",
        className,
      )}
    >
      <legend className="font-label flex items-center gap-1.5 px-1.5 text-[0.72rem] tracking-[0.08em] text-destructive">
        <Icon aria-hidden className="size-[13px]" />
        {label}
      </legend>
      <p className="font-semibold text-foreground">{question}</p>
      <p id={`${id}-how`} className="mt-1 mb-2.5 text-[0.84rem] text-dim-foreground">
        {children}
        {children ? " " : null}
        Type <b className="font-semibold text-foreground">{words}</b> to go ahead.
      </p>
      <div className="flex flex-wrap gap-2">
        <label htmlFor={`${id}-words`} className="sr-only">
          Type {words} to confirm
        </label>
        <Input
          id={`${id}-words`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirm();
            }
          }}
          aria-describedby={`${id}-how`}
          autoComplete="off"
          spellCheck={false}
          autoFocus
          className={cn(
            "min-w-40 flex-1 bg-background",
            ready && "border-destructive text-foreground ring-3 ring-destructive/15 focus-visible:border-destructive",
          )}
        />
        <Button type="button" variant="destructive-solid" disabled={!ready || pending} onClick={confirm}>
          {ActionIcon && <ActionIcon data-icon="inline-start" />}
          {pending ? "Working..." : actionLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}

// The usual way in: an orange outline button that opens the TypedConfirm in
// its place, and closes it again on Cancel or once the action went through.
export function TypedConfirmButton({
  triggerLabel,
  triggerIcon: TriggerIcon,
  size = "sm",
  onConfirm,
  ...confirm
}: Omit<TypedConfirmProps, "onCancel"> & {
  triggerLabel: string;
  triggerIcon?: LucideIcon;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button type="button" variant="destructive-outline" size={size} onClick={() => setOpen(true)}>
        {TriggerIcon && <TriggerIcon data-icon="inline-start" />}
        {triggerLabel}
      </Button>
    );
  }
  return (
    <TypedConfirm
      {...confirm}
      onConfirm={async () => {
        const result = await onConfirm();
        if (!(result && result.error)) setOpen(false);
        return result;
      }}
      onCancel={() => setOpen(false)}
    />
  );
}
