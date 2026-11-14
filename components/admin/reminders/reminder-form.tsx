"use client";

import { Check } from "lucide-react";
import type { GuildChannel, PublicReminder } from "@/lib/api/types";
import { browserZone, RECURRENCE_UNITS, reminderChannelOptions } from "@/lib/public-reminders";
import { useReminderForm } from "@/hooks/use-reminder-form";
import { DeskSelect } from "@/components/admin/desk/desk-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FIELD_LABEL = "font-label text-[0.82rem] tracking-[0.06em] text-faint-foreground";
const REPEATS = [{ value: "", label: "Doesn't repeat" }, ...RECURRENCE_UNITS];

// A new reminder, or one being edited in place: channel and time, the
// message, and how it repeats.
export function ReminderForm({
  reminder,
  channels,
  onCancel,
  onDone,
}: {
  reminder?: PublicReminder;
  channels: GuildChannel[];
  onCancel: () => void;
  onDone: () => void;
}) {
  const f = useReminderForm(reminder, onDone);
  const idBase = reminder ? `reminder-${reminder.reminder_id}` : "reminder-new";

  return (
    <form
      onSubmit={f.submit}
      aria-label={reminder ? `Edit reminder #${reminder.reminder_id}` : "New reminder"}
      className="space-y-3 rounded-md border border-highlight bg-card p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <span id={`${idBase}-channel`} className={FIELD_LABEL}>
            Channel
          </span>
          <DeskSelect
            groups={[{ options: reminderChannelOptions(channels, reminder?.channel_id ?? null) }]}
            value={f.channelId}
            onValueChange={f.setChannelId}
            placeholder="Pick a channel…"
            labelledBy={`${idBase}-channel`}
            required
          />
        </div>
        <Label variant="frame" className="space-y-1">
          <span className={FIELD_LABEL}>When (your time zone, {browserZone()})</span>
          <Input
            type="datetime-local"
            name="due_at"
            value={f.dueLocal}
            onChange={(e) => f.setDueLocal(e.target.value)}
            required
          />
        </Label>
      </div>
      <Label variant="frame" className="block space-y-1">
        <span className={FIELD_LABEL}>Message</span>
        <Textarea
          name="message"
          rows={3}
          className="inline-block min-h-0 px-3 text-sm field-sizing-fixed md:text-sm"
          value={f.message}
          onChange={(e) => f.setMessage(e.target.value)}
          required
        />
      </Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <span id={`${idBase}-repeats`} className={FIELD_LABEL}>
            Repeats
          </span>
          <DeskSelect
            groups={[{ options: REPEATS }]}
            value={f.recurUnit}
            onValueChange={f.setRecurUnit}
            labelledBy={`${idBase}-repeats`}
          />
        </div>
        {f.recurUnit && (
          <Label variant="frame" className="space-y-1">
            <span className={FIELD_LABEL}>Every how many {f.recurUnit}</span>
            <Input
              type="number"
              name="recur_every"
              min={1}
              step={1}
              value={f.recurEvery}
              onChange={(e) => f.setRecurEvery(e.target.value)}
              required
            />
          </Label>
        )}
      </div>
      {f.error && (
        <p role="alert" className="text-sm text-destructive">
          {f.error}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" variant="highlight" disabled={f.pending}>
          <Check data-icon="inline-start" />
          {reminder ? "Save" : "Create reminder"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={f.pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
