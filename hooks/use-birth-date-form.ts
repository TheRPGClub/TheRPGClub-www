"use client";

import { useState, useTransition } from "react";
import { saveBirthDateAction, shareBirthdayAction } from "@/app/actions/birth-date";
import {
  birthDateFields,
  birthDateFromFields,
  birthDateLimit,
  birthdayShareSwitch,
  formatBirthDate,
  type BirthDate,
  type BirthDateFields,
} from "@/lib/birth-date";

// The Birth Date form's state: the Day, Month and optional Year being
// picked, the API's document (which carries the changes left this month and
// whether the Birthday is shared), the save, and the "Share my Birthday"
// switch. Each save answers with the whole document, so the limit line and
// the switch follow it. A refusal at the limit locks the date and shows the
// API's words, which name the date it opens again; the switch never locks.
// `userId` is the member staff are setting it for; without it the form is
// the signed-in member's own.
export function useBirthDateForm({
  initial,
  staff,
  today,
  userId,
}: {
  initial: BirthDate;
  staff: boolean;
  // The club's date (YYYY-MM-DD): the latest a dated Birth Date may be.
  today: string;
  userId?: string;
}) {
  const [doc, setDoc] = useState(initial);
  const [fields, setFields] = useState(() => birthDateFields(initial.birth_date));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [shareError, setShareError] = useState<string | null>(null);
  const [sharePending, startSharing] = useTransition();

  const limit = birthDateLimit(doc, staff);
  const current = birthDateFields(doc.birth_date);
  const changed =
    fields.day !== current.day || fields.month !== current.month || fields.year.trim() !== current.year;

  function send(birthDate: string | null) {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      let result: Awaited<ReturnType<typeof saveBirthDateAction>>;
      try {
        result = await saveBirthDateAction({ userId, birthDate });
      } catch {
        result = { ok: false, error: "Couldn't save the Birth Date. Try again." };
      }
      if (result.ok) {
        setDoc(result.data);
        setFields(birthDateFields(result.data.birth_date));
        setSaved(result.data.birth_date ? `Saved: ${formatBirthDate(result.data.birth_date)}.` : "Removed.");
        return;
      }
      setError(result.error);
      const nextChangeOn = result.nextChangeOn;
      if (nextChangeOn) setDoc((d) => ({ ...d, changes_left_this_month: 0, next_change_on: nextChangeOn }));
    });
  }

  function save() {
    const parsed = birthDateFromFields(fields, today);
    if (!parsed.ok) {
      setSaved(null);
      setError(parsed.error);
      return;
    }
    send(parsed.value);
  }

  // The switch moves at once and springs back with the reason if the API
  // refuses. Sharing is the member's own: it isn't counted toward the limit.
  function share(next: boolean) {
    const before = doc.birthday_shared;
    setShareError(null);
    setDoc((d) => ({ ...d, birthday_shared: next }));
    startSharing(async () => {
      let result: Awaited<ReturnType<typeof shareBirthdayAction>>;
      try {
        result = await shareBirthdayAction(next);
      } catch {
        result = { ok: false, error: "Couldn't save that switch. Try again." };
      }
      if (result.ok) {
        setDoc(result.data);
        return;
      }
      setDoc((d) => ({ ...d, birthday_shared: before }));
      setShareError(result.error);
    });
  }

  return {
    doc,
    fields,
    setField: (field: keyof BirthDateFields, value: string) => {
      setFields((f) => ({ ...f, [field]: value }));
      setSaved(null);
    },
    error,
    saved,
    pending,
    limit,
    // Save is off until the day and month are picked and differ from the
    // saved Birth Date, and while the member is at the limit.
    canSave: changed && fields.day !== "" && fields.month !== "" && !limit.locked && !pending,
    canRemove: doc.birth_date !== null && !limit.locked && !pending,
    save,
    remove: () => send(null),
    shareSwitch: birthdayShareSwitch(doc),
    sharePending,
    shareError,
    share,
  };
}
