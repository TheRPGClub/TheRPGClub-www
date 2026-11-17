"use client";

import { useId } from "react";
import { Lock, X } from "lucide-react";
import type { BirthDate } from "@/lib/birth-date";
import { useBirthDateForm } from "@/hooks/use-birth-date-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// One Birth Date: a date field (1900 to the club's today), Save, and Remove
// while one is set, with the limit line under them. The member's own field
// locks once both changes this month are used, saying when it opens again;
// staff are never limited. Errors sit under the line, as the settings
// switches' do.
export function BirthDateEditor({
  initial,
  staff,
  today,
  userId,
  label = "Your Birth Date",
  note,
}: {
  initial: BirthDate;
  // Moderator or above: changes don't count toward the limit.
  staff: boolean;
  // The club's date (YYYY-MM-DD), read on the server.
  today: string;
  // Another member's, set by staff.
  userId?: string;
  label?: string;
  // The line under the field in place of the limit line (the staff desk
  // shows the member's own changes left), from the latest document.
  note?: (doc: BirthDate) => string;
}) {
  const f = useBirthDateForm({ initial, staff, userId });
  const id = useId();
  const lineId = `${id}-line`;
  const errorId = `${id}-error`;

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (f.canSave) f.save();
      }}
    >
      <Label variant="field" htmlFor={id}>
        {label}
      </Label>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
        <Input
          id={id}
          type="date"
          min="1900-01-01"
          max={today}
          value={f.value}
          onChange={(e) => f.setValue(e.target.value)}
          disabled={f.limit.locked || f.pending}
          aria-describedby={cn(lineId, f.error && errorId)}
          aria-invalid={f.error ? true : undefined}
          className="w-40"
        />
        <Button type="submit" variant="highlight" disabled={!f.canSave}>
          {f.pending ? "Saving" : "Save"}
        </Button>
        {f.doc.birth_date && (
          <Button type="button" variant="destructive-ghost" disabled={!f.canRemove} onClick={f.remove}>
            <X aria-hidden />
            Remove
          </Button>
        )}
      </div>
      {/* At the limit with the API's refusal showing, the refusal says it. */}
      {!(f.error && f.limit.locked) && (
        <p id={lineId} className="flex items-center gap-1.5 text-sm text-dim-foreground">
          {f.limit.locked && <Lock aria-hidden className="size-3.5 shrink-0" />}
          {note ? note(f.doc) : f.limit.line}
        </p>
      )}
      {f.error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {f.error}
        </p>
      )}
      <p role="status" className="text-sm text-dim-foreground empty:hidden">
        {f.saved}
      </p>
    </form>
  );
}
