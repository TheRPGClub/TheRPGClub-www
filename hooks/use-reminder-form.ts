"use client";

import { useState, useTransition } from "react";
import {
  createPublicReminderAction,
  updatePublicReminderAction,
  type ReminderFormInput,
} from "@/app/actions/public-reminders";
import type { PublicReminder } from "@/lib/api/types";
import { localInputToOffsetIso, toLocalInputValue, validateReminderInput } from "@/lib/public-reminders";

// A reminder's form: its channel, time (in the admin's zone), message and
// recurrence, checked before it is sent; `onDone` runs once it saved.
export function useReminderForm(reminder: PublicReminder | undefined, onDone: () => void) {
  const [channelId, setChannelId] = useState(reminder?.channel_id ?? "");
  const [dueLocal, setDueLocal] = useState(reminder ? toLocalInputValue(reminder.due_at) : "");
  const [message, setMessage] = useState(reminder?.message ?? "");
  const [recurEvery, setRecurEvery] = useState(reminder?.recur_every ? String(reminder.recur_every) : "");
  const [recurUnit, setRecurUnit] = useState<string>(reminder?.recur_unit ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: ReminderFormInput = {
      channel_id: channelId,
      message,
      due_at: localInputToOffsetIso(dueLocal),
      recur_every: recurUnit ? recurEvery : null,
      recur_unit: recurUnit || null,
    };
    const checked = validateReminderInput(input);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = reminder
        ? await updatePublicReminderAction(reminder.reminder_id, input)
        : await createPublicReminderAction(input);
      if (!result.ok) {
        setError(result.error ?? "Failed to save.");
        return;
      }
      onDone();
    });
  };

  return {
    channelId,
    setChannelId,
    dueLocal,
    setDueLocal,
    message,
    setMessage,
    recurEvery,
    setRecurEvery,
    recurUnit,
    setRecurUnit,
    error,
    pending,
    submit,
  };
}
