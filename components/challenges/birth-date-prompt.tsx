"use client";

import { useId, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveBirthDateAction } from "@/app/actions/birth-date";
import { clubToday } from "@/lib/birth-date";
import type { BirthPrompt } from "@/hooks/use-start-run";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Starting a birth-year Slots Run without a Birth Date (www#109): the API's
// refusal says why, the member enters the date here (saved as on /settings,
// www#108, under the same limit), and the Run starts. The notice that the
// birth year will show comes before they save it.
export function BirthDatePrompt({ prompt, pending }: { prompt: BirthPrompt; pending: boolean }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const busy = saving || pending;

  const save = () =>
    startSaving(async () => {
      setError(null);
      const result = await saveBirthDateAction({ birthDate: value });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      prompt.onSaved();
    });

  return (
    <Dialog open={prompt.message !== null} onOpenChange={(open) => !open && prompt.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your Birth Date</DialogTitle>
          <DialogDescription>{prompt.message}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (value && !busy) save();
          }}
        >
          <Label variant="field" htmlFor={id}>
            Your Birth Date
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id={id}
              type="date"
              min="1900-01-01"
              max={clubToday()}
              value={value}
              autoFocus
              onChange={(e) => setValue(e.target.value)}
              aria-invalid={error ? true : undefined}
              className="w-44"
            />
            <Button type="submit" variant="highlight" disabled={!value || busy}>
              {busy && <Loader2 aria-hidden className="motion-safe:animate-spin" />}
              Save and start
            </Button>
          </div>
          <p className="text-sm text-dim-foreground">
            Your birth year will show on your Run. Only you and staff see the full date, and you can change it in
            Settings.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
