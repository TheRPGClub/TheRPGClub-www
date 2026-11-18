"use client";

import { useId, useState, useTransition } from "react";
import { readMemberBirthDateAction } from "@/app/actions/member-birth-date";
import type { User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import type { StaffBirthDate } from "@/lib/staff-birth-date";
import { MemberPicker } from "@/components/admin/member-picker";
import { MemberBirthDateEditor } from "@/components/admin/birth-dates/member-birth-date-editor";

const LABEL = "font-label block text-[0.82rem] tracking-[0.08em] text-faint-foreground";

type Loaded = { member: User; doc: StaffBirthDate } | { member: User; error: string };

// Staff set a member's Birth Date: pick the member (the desk's member
// picker), their Birth Date is read, then its Day, Month and optional Year,
// never limited, and whether they share their Birthday (staff can switch it
// off, never on). "Change" clears the pick for the next member.
export function BirthDateForMember({ today }: { today: string }) {
  const memberLabelId = useId();
  const [member, setMember] = useState<User | null>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(next: User | null) {
    setMember(next);
    setLoaded(null);
    if (!next) return;
    startTransition(async () => {
      const result = await readMemberBirthDateAction(next.user_id);
      setLoaded(result.ok ? { member: next, doc: result.data } : { member: next, error: result.error });
    });
  }

  const current = loaded && member && loaded.member.user_id === member.user_id ? loaded : null;

  return (
    <div className="mt-6 flex max-w-2xl flex-col gap-7">
      <div>
        <span id={memberLabelId} className={LABEL}>
          Member
        </span>
        <MemberPicker value={member} onChange={pick} autoFocus labelId={memberLabelId} />
      </div>

      {member && pending && !current && (
        <p role="status" className="text-sm text-faint-foreground">
          Reading {memberName(member)}&apos;s Birth Date…
        </p>
      )}
      {current && "error" in current && (
        <p role="alert" className="text-sm text-destructive">
          {current.error}
        </p>
      )}
      {current && "doc" in current && (
        <MemberBirthDateEditor
          key={current.member.user_id}
          initial={current.doc}
          userId={current.member.user_id}
          name={memberName(current.member)}
          today={today}
        />
      )}
    </div>
  );
}
