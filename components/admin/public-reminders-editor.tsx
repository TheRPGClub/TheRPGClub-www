"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createPublicReminderAction,
  deletePublicReminderAction,
  updatePublicReminderAction,
  type ReminderFormInput,
} from "@/app/actions/public-reminders";
import type { GuildChannel, PublicReminder } from "@/lib/api/types";
import { guildChannelLabel } from "@/lib/api/guild-channel-label";
import {
  CLUB_TIME_ZONE,
  formatReminderTime,
  localInputToOffsetIso,
  RECURRENCE_UNITS,
  recurrenceLabel,
  toLocalInputValue,
  validateReminderInput,
} from "@/lib/public-reminders";
import { EDIT_SELECT_CLASS } from "@/components/member/game-list-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const noop = () => () => {};

// True once in the browser. Local times depend on the admin's zone, which
// the server doesn't know, so they render only after hydration.
function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

function browserZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function PublicRemindersEditor({
  reminders,
  channels,
}: {
  reminders: PublicReminder[];
  // Null when the synced channel list can't be read.
  channels: GuildChannel[] | null;
}) {
  const router = useRouter();
  const isClient = useIsClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const channelName = (id: string) => {
    const channel = channels?.find((c) => c.channel_id === id);
    return channel ? guildChannelLabel(channel) : `Unknown channel (${id})`;
  };

  const handleDelete = (reminder: PublicReminder) => {
    if (!confirm(`Delete reminder #${reminder.reminder_id}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deletePublicReminderAction(reminder.reminder_id);
      if (!result.ok) {
        setError(result.error ?? "Failed to delete.");
        return;
      }
      router.refresh();
    });
  };

  // Close the form in the same transition as the refresh, so the row comes
  // back with the saved values rather than flashing the old ones.
  const done = () => {
    startTransition(() => {
      setAdding(false);
      setEditingId(null);
      setError(null);
      router.refresh();
    });
  };

  return (
    <section aria-label="Public reminders" className="space-y-4">
      <p className="text-sm text-paper-mute">
        The bot posts each message in its channel when it is due. Times show in
        your time zone{isClient ? ` (${browserZone()})` : ""} and in club time (
        {CLUB_TIME_ZONE}).
      </p>

      {channels === null && (
        <p role="alert" className="text-sm text-destructive">
          {
            "Couldn't load the channel list, so reminders can't be added or edited right now."
          }
        </p>
      )}
      {channels !== null && channels.length === 0 && (
        <p role="alert" className="text-sm text-destructive">
          {
            "No channels have been synced from Discord yet. The bot sends the list when it starts."
          }
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {adding ? (
        <ReminderForm
          channels={channels ?? []}
          onCancel={() => setAdding(false)}
          onDone={done}
        />
      ) : (
        <Button
          variant="highlight"
          onClick={() => {
            setEditingId(null);
            setAdding(true);
          }}
          disabled={!channels?.length}
        >
          <Plus data-icon="inline-start" />
          New reminder
        </Button>
      )}

      <ul className="border-t-2 border-paper">
        {reminders.length === 0 && (
          <li className="border-b border-rule py-3 text-paper-dim">
            No public reminders scheduled.
          </li>
        )}
        {reminders.map((reminder) =>
          editingId === reminder.reminder_id ? (
            <li
              key={reminder.reminder_id}
              className="border-b border-rule py-3"
            >
              <ReminderForm
                reminder={reminder}
                channels={channels ?? []}
                onCancel={() => setEditingId(null)}
                onDone={done}
              />
            </li>
          ) : (
            <li
              key={reminder.reminder_id}
              className="flex flex-col gap-2 border-b border-rule py-3 sm:flex-row sm:items-start"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-label text-[0.82rem] tracking-[0.06em] text-paper-mute">
                  #{reminder.reminder_id} · {channelName(reminder.channel_id)}
                  {recurrenceLabel(reminder)
                    ? ` · ${recurrenceLabel(reminder)}`
                    : ""}
                </p>
                <p className="font-semibold text-paper">
                  {isClient ? formatReminderTime(reminder.due_at) : " "}
                </p>
                <p className="text-sm text-paper-dim">
                  {/* Client-only too: Node's and the browser's Intl can space it differently. */}
                  Club time:{" "}
                  {isClient
                    ? formatReminderTime(reminder.due_at, CLUB_TIME_ZONE)
                    : ""}
                </p>
                <p className="text-sm whitespace-pre-wrap text-paper">
                  {reminder.message}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAdding(false);
                    setError(null);
                    setEditingId(reminder.reminder_id);
                  }}
                  disabled={pending || channels === null}
                >
                  <Pencil data-icon="inline-start" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(reminder)}
                  disabled={pending}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

function ReminderForm({
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
  const [channelId, setChannelId] = useState(reminder?.channel_id ?? "");
  const [dueLocal, setDueLocal] = useState(
    reminder ? toLocalInputValue(reminder.due_at) : "",
  );
  const [message, setMessage] = useState(reminder?.message ?? "");
  const [recurEvery, setRecurEvery] = useState(
    reminder?.recur_every ? String(reminder.recur_every) : "",
  );
  const [recurUnit, setRecurUnit] = useState<string>(
    reminder?.recur_unit ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // A stored channel the bot hasn't synced stays selectable, so an edit
  // that keeps it doesn't have to move the reminder.
  const unsyncedChannelId =
    reminder && !channels.some((c) => c.channel_id === reminder.channel_id)
      ? reminder.channel_id
      : null;

  const handleSubmit = (e: React.FormEvent) => {
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

  const fieldLabel =
    "font-label text-[0.82rem] tracking-[0.06em] text-paper-mute";

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={
        reminder ? `Edit reminder #${reminder.reminder_id}` : "New reminder"
      }
      className="space-y-3 rounded-md border border-highlight bg-ink-2 p-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={fieldLabel}>Channel</span>
          <select
            name="channel_id"
            className={EDIT_SELECT_CLASS}
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            required
          >
            <option value="" disabled>
              Pick a channel…
            </option>
            {unsyncedChannelId && (
              <option value={unsyncedChannelId}>
                Current channel ({unsyncedChannelId}, not synced)
              </option>
            )}
            {channels.map((c) => (
              <option key={c.channel_id} value={c.channel_id}>
                {guildChannelLabel(c)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={fieldLabel}>
            When (your time zone, {browserZone()})
          </span>
          <Input
            type="datetime-local"
            name="due_at"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className={fieldLabel}>Message</span>
        <textarea
          name="message"
          rows={3}
          className="w-full min-w-0 rounded-sm border border-rule bg-ink-2 px-3 py-2 text-sm text-paper caret-highlight outline-none focus-visible:border-paper-mute focus-visible:ring-2 focus-visible:ring-highlight/40"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className={fieldLabel}>Repeats</span>
          <select
            name="recur_unit"
            className={EDIT_SELECT_CLASS}
            value={recurUnit}
            onChange={(e) => setRecurUnit(e.target.value)}
          >
            <option value="">{"Doesn't repeat"}</option>
            {RECURRENCE_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
        {recurUnit && (
          <label className="space-y-1">
            <span className={fieldLabel}>Every how many {recurUnit}</span>
            <Input
              type="number"
              name="recur_every"
              min={1}
              step={1}
              value={recurEvery}
              onChange={(e) => setRecurEvery(e.target.value)}
              required
            />
          </label>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-1">
        <Button type="submit" variant="highlight" disabled={pending}>
          <Check data-icon="inline-start" />
          {reminder ? "Save" : "Create reminder"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
