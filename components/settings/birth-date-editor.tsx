"use client";

import { useId } from "react";
import { Lock, X } from "lucide-react";
import type { BirthDate } from "@/lib/birth-date";
import { useBirthDateForm } from "@/hooks/use-birth-date-form";
import { Button } from "@/components/ui/button";
import { BirthDateFields } from "@/components/birth-date/birth-date-fields";
import { ShareBirthdayRow } from "@/components/settings/share-birthday-row";
import { cn } from "@/lib/utils";

// The member's own Birth Date on /settings: Day, Month and an optional
// Year, Save, and Remove while one is set, with the limit line under them.
// The form locks once both changes this month are used, saying when it opens
// again; staff are never limited. Errors sit under the line, as the settings
// switches' do. The "Share my Birthday" row follows, which the limit never
// locks. Staff set another member's on the desk (MemberBirthDateEditor).
export function BirthDateEditor({
  initial,
  staff,
  today,
}: {
  initial: BirthDate;
  // Moderator or above: changes don't count toward the limit.
  staff: boolean;
  // The club's date (YYYY-MM-DD), read on the server.
  today: string;
}) {
  const f = useBirthDateForm({ initial, staff, today });
  const id = useId();
  const lineId = `${id}-line`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-6">
      <form
        aria-label="Your Birth Date"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (f.canSave) f.save();
        }}
      >
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
            {f.limit.line}
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
      <ShareBirthdayRow state={f.shareSwitch} pending={f.switchBusy} error={f.shareError} onChange={f.share} />
    </div>
  );
}
