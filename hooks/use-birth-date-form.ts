"use client";

import { useState, useTransition } from "react";
import { saveBirthDateAction } from "@/app/actions/birth-date";
import { birthDateLimit, formatBirthDate, type BirthDate } from "@/lib/birth-date";

// The Birth Date field's state: the date being typed, the API's document
// (which carries the changes left this month), and the save. Each save
// answers with the whole document, so the limit line follows it. A refusal
// at the limit locks the field and shows the API's words, which name the
// date it opens again. `userId` is the member staff are setting it for;
// without it the field is the signed-in member's own.
export function useBirthDateForm({
  initial,
  staff,
  userId,
}: {
  initial: BirthDate;
  staff: boolean;
  userId?: string;
}) {
  const [doc, setDoc] = useState(initial);
  const [value, setValue] = useState(initial.birth_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const limit = birthDateLimit(doc, staff);
  const changed = value !== (doc.birth_date ?? "");

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
        setValue(result.data.birth_date ?? "");
        setSaved(result.data.birth_date ? `Saved: ${formatBirthDate(result.data.birth_date)}.` : "Removed.");
        return;
      }
      setError(result.error);
      const nextChangeOn = result.nextChangeOn;
      if (nextChangeOn) setDoc((d) => ({ ...d, changes_left_this_month: 0, next_change_on: nextChangeOn }));
    });
  }

  return {
    doc,
    value,
    setValue: (next: string) => {
      setValue(next);
      setSaved(null);
    },
    error,
    saved,
    pending,
    limit,
    // Save is off while nothing changed or the member is at the limit.
    canSave: changed && value !== "" && !limit.locked && !pending,
    canRemove: doc.birth_date !== null && !limit.locked && !pending,
    save: () => send(value),
    remove: () => send(null),
  };
}
