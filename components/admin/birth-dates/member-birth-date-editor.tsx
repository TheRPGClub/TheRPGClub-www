"use client";

import { useId } from "react";
import { X } from "lucide-react";
import { memberChangesLine } from "@/lib/birth-date";
import type { StaffBirthDate } from "@/lib/staff-birth-date";
import { useMemberBirthDate } from "@/hooks/use-member-birth-date";
import { Button } from "@/components/ui/button";
import { BirthDateFields } from "@/components/birth-date/birth-date-fields";
import { MemberSharingRow } from "@/components/admin/birth-dates/member-sharing-row";
import { cn } from "@/lib/utils";

// Staff set one member's Birth Date: Day, Month and an optional Year, Save,
// and Remove while one is set, with the member's own changes left under
// them (staff are never limited). Under it the sharing row, as on /settings
// (pick A): staff can switch a shared Birthday off, never on.
export function MemberBirthDateEditor({
  initial,
  userId,
  name,
  today,
}: {
  initial: StaffBirthDate;
  userId: string;
  // The member's name, for the caption and the sharing row.
  name: string;
  // The club's date (YYYY-MM-DD), read on the server.
  today: string;
}) {
  const f = useMemberBirthDate({ initial, userId, today });
  const id = useId();
  const lineId = `${id}-line`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col">
      <form
        aria-labelledby={`${id}-title`}
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (f.canSave) f.save();
        }}
      >
        <p id={`${id}-title`} className="font-label text-[0.95rem] font-bold text-foreground">
          {name}&apos;s Birth Date
        </p>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
          <BirthDateFields
            parts={f.parts}
            onChange={f.setPart}
            disabled={f.pending === "date"}
            invalid={Boolean(f.error)}
            describedBy={cn(lineId, f.error && errorId)}
          />
          <div className="flex items-center gap-1">
            <Button type="submit" variant="highlight" disabled={!f.canSave}>
              {f.pending === "date" ? "Saving" : "Save"}
            </Button>
            {f.doc.birth_date && (
              <Button type="button" variant="destructive-ghost" disabled={!f.canRemove} onClick={f.remove}>
                <X aria-hidden />
                Remove
              </Button>
            )}
          </div>
        </div>
        <p id={lineId} className="text-sm text-dim-foreground">
          {memberChangesLine(f.doc)}
        </p>
        {f.error && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {f.error}
          </p>
        )}
        <p role="status" className="text-sm text-dim-foreground empty:hidden">
          {f.saved}
        </p>
      </form>
      <MemberSharingRow
        doc={f.doc}
        name={name}
        pending={f.pending === "sharing"}
        error={f.sharingError}
        saved={f.sharingSaved}
        onStop={f.stopSharing}
      />
    </div>
  );
}
