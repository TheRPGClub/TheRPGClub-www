"use client";

import { useId } from "react";
import { Lock, X } from "lucide-react";
import type { BirthDate } from "@/lib/birth-date";
import { useBirthDateForm } from "@/hooks/use-birth-date-form";
import { Button } from "@/components/ui/button";
import { BirthDateFields } from "@/components/settings/birth-date-fields";
import { ShareBirthdayRow } from "@/components/settings/share-birthday-row";
import { cn } from "@/lib/utils";

// One Birth Date: Day, Month and an optional Year, Save, and Remove while one
// is set, with the limit line under them. The member's own form locks once
// both changes this month are used, saying when it opens again; staff are
// never limited. Errors sit under the line, as the settings switches' do.
// With `share` (the member's own /settings) the "Share my Birthday" row
// follows, which the limit never locks.
export function BirthDateEditor({
  initial,
  staff,
  today,
  userId,
  label,
  note,
  share = false,
}: {
  initial: BirthDate;
  // Moderator or above: changes don't count toward the limit.
  staff: boolean;
  // The club's date (YYYY-MM-DD), read on the server.
  today: string;
  // Another member's, set by staff.
  userId?: string;
  // The form's caption, when it isn't the member's own (the staff desk).
  label?: string;
  // The line under the field in place of the limit line (the staff desk
  // shows the member's own changes left), from the latest document.
  note?: (doc: BirthDate) => string;
  share?: boolean;
}) {
  const f = useBirthDateForm({ initial, staff, today, userId });
  const id = useId();
  const lineId = `${id}-line`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-6">
      <form
        aria-label={label ?? "Your Birth Date"}
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (f.canSave) f.save();
        }}
      >
        {label && <p className="font-label text-[0.95rem] font-bold text-foreground">{label}</p>}
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <BirthDateFields
            fields={f.fields}
            onChange={f.setField}
            disabled={f.limit.locked || f.pending}
            describedBy={cn(lineId, f.error && errorId)}
            invalid={Boolean(f.error)}
          />
          <div className="flex items-center gap-2 max-sm:basis-full">
            <Button type="submit" variant="highlight" disabled={!f.canSave} className="h-9">
              {f.pending ? "Saving" : "Save"}
            </Button>
            {f.doc.birth_date && (
              <Button type="button" variant="destructive-ghost" disabled={!f.canRemove} onClick={f.remove}>
                <X aria-hidden />
                Remove
              </Button>
            )}
          </div>
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
      {share && (
        <ShareBirthdayRow state={f.shareSwitch} pending={f.sharePending} error={f.shareError} onChange={f.share} />
      )}
    </div>
  );
}
