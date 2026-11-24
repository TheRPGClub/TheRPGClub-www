"use client";

import { Minus, Plus } from "lucide-react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// The Optional target as a stepper (pick 8A): "Clear [- 2 +] of 12". It
// never goes below 0; past the Optional count the number turns signal
// orange at once and the error says why.
export function TargetStepper({ form, className }: { form: ChallengeFormState; className?: string }) {
  const { draft, columns, preview, errors } = form;
  const target = draft.optionalTarget;
  const invalid = !!errors.target;
  return (
    <div role="group" aria-label="Optional Games to Clear" className={cn("flex items-center gap-2", className)}>
      <span className="font-label text-[0.8rem] tracking-[0.08em] text-dim-foreground">Clear</span>
      <Button
        type="button"
        variant="step"
        size="icon-sm"
        aria-label="One fewer Optional Game"
        disabled={target === 0}
        onClick={() => form.stepTarget(-1)}
      >
        <Minus aria-hidden />
      </Button>
      <output
        aria-live="polite"
        className={cn(
          "font-headline min-w-[2ch] text-center text-[1.75rem] leading-none tabular-nums",
          invalid ? "text-destructive" : "text-foreground",
        )}
      >
        {target}
      </output>
      <Button
        type="button"
        variant="step"
        size="icon-sm"
        aria-label="One more Optional Game"
        onClick={() => form.stepTarget(1)}
      >
        <Plus aria-hidden />
      </Button>
      <span className="font-label text-[0.8rem] tracking-[0.08em] text-dim-foreground">
        {preview.loading ? "of …" : `of ${columns.optionalCount}`}
      </span>
    </div>
  );
}
