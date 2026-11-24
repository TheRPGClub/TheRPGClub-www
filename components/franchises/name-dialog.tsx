"use client";

import { useId, useState, useTransition, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// A Franchise's name, asked for in a dialog: New Franchise and Rename. The
// action answers an error to show, or null when it went through.
export function NameDialog({
  trigger,
  title,
  description,
  initial = "",
  submitLabel,
  pendingLabel,
  onSubmit,
  children,
}: {
  trigger: ReactElement;
  // The trigger's label.
  children: ReactNode;
  title: string;
  description: string;
  initial?: string;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (name: string) => Promise<string | null>;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = name.trim().length > 0 && name.trim() !== initial.trim();

  const submit = () => {
    if (!ready || pending) return;
    startTransition(async () => {
      const problem = await onSubmit(name);
      if (problem) setError(problem);
      else setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        setName(initial);
        setError(null);
      }}
    >
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label htmlFor={id} className="font-label block text-[0.82rem] tracking-[0.08em] text-faint-foreground">
            Name
          </label>
          <Input id={id} value={name} maxLength={255} autoFocus onChange={(e) => setName(e.target.value)} aria-invalid={!!error} />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="submit" variant="highlight" disabled={!ready || pending}>
              {pending ? pendingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
