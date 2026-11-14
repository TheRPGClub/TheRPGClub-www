"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { PublicReminder } from "@/lib/api/types";
import { CLUB_TIME_ZONE, formatReminderTime, recurrenceLabel } from "@/lib/public-reminders";
import { Button } from "@/components/ui/button";

// One upcoming reminder: its number, channel and recurrence, the time in the
// viewer's zone and in club time, the message, and Edit and Delete. Times
// show only in the browser (`isClient`): the server doesn't know the zone,
// and Node's and the browser's Intl can space them differently.
export function ReminderRow({
  reminder,
  channelName,
  isClient,
  onEdit,
  onDelete,
  editDisabled,
  deleteDisabled,
}: {
  reminder: PublicReminder;
  channelName: string;
  isClient: boolean;
  onEdit: () => void;
  onDelete: () => void;
  editDisabled: boolean;
  deleteDisabled: boolean;
}) {
  const recurrence = recurrenceLabel(reminder);
  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-label text-[0.82rem] tracking-[0.06em] text-faint-foreground">
          #{reminder.reminder_id} · {channelName}
          {recurrence ? ` · ${recurrence}` : ""}
        </p>
        <p className="font-semibold text-foreground">{isClient ? formatReminderTime(reminder.due_at) : " "}</p>
        <p className="text-sm text-dim-foreground">
          Club time: {isClient ? formatReminderTime(reminder.due_at, CLUB_TIME_ZONE) : ""}
        </p>
        <p className="text-sm whitespace-pre-wrap text-foreground">{reminder.message}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="outline" size="sm" onClick={onEdit} disabled={editDisabled}>
          <Pencil data-icon="inline-start" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleteDisabled}>
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </div>
    </li>
  );
}
