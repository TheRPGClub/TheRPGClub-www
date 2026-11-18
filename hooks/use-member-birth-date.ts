"use client";

import { useState, useTransition } from "react";
import {
  saveMemberBirthDateAction,
  stopMemberBirthdaySharingAction,
  type MemberBirthDateResult,
} from "@/app/actions/member-birth-date";
import { birthDateParts, birthDateValue, setBirthDatePart, type BirthDateParts } from "@/lib/birth-date-parts";
import { staffSavedLine, type StaffBirthDate } from "@/lib/staff-birth-date";

const FAILED = "Couldn't save. Try again.";

// The staff desk's editor for one member (www#118): the Day/Month/Year
// parts, the API's document (Birth Date and sharing), and the three saves.
// Each save answers with the whole document. The date's and the sharing
// row's error and confirmation are kept apart, each under its own control.
export function useMemberBirthDate({ initial, userId, today }: { initial: StaffBirthDate; userId: string; today: string }) {
  const [doc, setDoc] = useState(initial);
  const [parts, setParts] = useState<BirthDateParts>(() => birthDateParts(initial.birth_date));
  const [error, setError] = useState<string | null>(null);
  const [sharingError, setSharingError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ kind: "date" | "sharing"; line: string } | null>(null);
  const [pending, setPending] = useState<"date" | "sharing" | null>(null);
  const [, startTransition] = useTransition();

  const value = birthDateValue(parts, today);
  const changed = value.ok ? value.value !== doc.birth_date : parts.day !== "" || parts.month !== "" || parts.year !== "";

  function send(kind: "date" | "sharing", call: () => Promise<MemberBirthDateResult>) {
    setError(null);
    setSharingError(null);
    setSaved(null);
    setPending(kind);
    startTransition(async () => {
      let result: MemberBirthDateResult;
      try {
        result = await call();
      } catch {
        result = { ok: false, error: FAILED };
      }
      setPending(null);
      if (!result.ok) {
        (kind === "date" ? setError : setSharingError)(result.error);
        return;
      }
      setSaved({ kind, line: staffSavedLine(doc, result.data) });
      setDoc(result.data);
      setParts(birthDateParts(result.data.birth_date));
    });
  }

  return {
    doc,
    parts,
    setPart: (field: keyof BirthDateParts, next: string) => {
      setParts((p) => setBirthDatePart(p, field, next));
      setError(null);
      setSaved(null);
    },
    error,
    sharingError,
    // The confirmation, under the date or under the sharing row.
    saved: saved?.kind === "date" ? saved.line : null,
    sharingSaved: saved?.kind === "sharing" ? saved.line : null,
    pending,
    canSave: changed && pending === null,
    canRemove: doc.birth_date !== null && pending === null,
    save: () => {
      if (!value.ok) return setError(value.error);
      send("date", () => saveMemberBirthDateAction({ userId, birthDate: value.value }));
    },
    remove: () => send("date", () => saveMemberBirthDateAction({ userId, birthDate: null })),
    stopSharing: () => send("sharing", () => stopMemberBirthdaySharingAction(userId)),
  };
}
