"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { deletePublicReminderAction } from "@/app/actions/public-reminders";
import type { GuildChannel, PublicReminder } from "@/lib/api/types";
import { guildChannelLabel } from "@/lib/api/guild-channel-label";
import { browserZone, CLUB_TIME_ZONE } from "@/lib/public-reminders";
import { useIsClient } from "@/hooks/use-is-client";
import { ReminderForm } from "@/components/admin/reminders/reminder-form";
import { ReminderRow } from "@/components/admin/reminders/reminder-row";
import { Button } from "@/components/ui/button";

const ALERT = "text-sm text-destructive";

// /admin/reminders: the upcoming public reminders, each editable in place,
// with New reminder over the list. Adding and editing need the synced
// channel list.
export function PublicRemindersEditor({
  reminders,
  channels,
}: {
  reminders: PublicReminder[];
  // Null when the synced channel list can't be read.
  channels: GuildChannel[] | null;
}) {
  const isClient = useIsClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const channelName = (id: string) => {
    const channel = channels?.find((c) => c.channel_id === id);
    return channel ? guildChannelLabel(channel) : `Unknown channel (${id})`;
  };

  // After the row's confirm: an error stays in the confirm.
  const handleDelete = async (reminder: PublicReminder) => {
    setError(null);
    const result = await deletePublicReminderAction(reminder.reminder_id);
    return result.ok ? null : (result.error ?? "Failed to delete.");
  };

  // The action's revalidatePath has already brought the saved values in by
  // the time this runs, so the row comes back with them.
  const done = () =>
    startTransition(() => {
      setAdding(false);
      setEditingId(null);
      setError(null);
    });

  return (
    <section aria-label="Public reminders" className="space-y-4">
      <p className="text-sm text-faint-foreground">
        The bot posts each message in its channel when it is due. Times show in your time zone
        {isClient ? ` (${browserZone()})` : ""} and in club time ({CLUB_TIME_ZONE}).
      </p>

      {channels === null && (
        <p role="alert" className={ALERT}>
          {"Couldn't load the channel list, so reminders can't be added or edited right now."}
        </p>
      )}
      {channels !== null && channels.length === 0 && (
        <p role="alert" className={ALERT}>
          {"No channels have been synced from Discord yet. The bot sends the list when it starts."}
        </p>
      )}
      {error && (
        <p role="alert" className={ALERT}>
          {error}
        </p>
      )}

      {adding ? (
        <ReminderForm channels={channels ?? []} onCancel={() => setAdding(false)} onDone={done} />
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

      <ul className="border-t-2 border-foreground">
        {reminders.length === 0 && (
          <li className="border-b border-border py-3 text-dim-foreground">No public reminders scheduled.</li>
        )}
        {reminders.map((reminder) =>
          editingId === reminder.reminder_id ? (
            <li key={reminder.reminder_id} className="border-b border-border py-3">
              <ReminderForm
                reminder={reminder}
                channels={channels ?? []}
                onCancel={() => setEditingId(null)}
                onDone={done}
              />
            </li>
          ) : (
            <ReminderRow
              key={reminder.reminder_id}
              reminder={reminder}
              channelName={channelName(reminder.channel_id)}
              isClient={isClient}
              onEdit={() => {
                setAdding(false);
                setError(null);
                setEditingId(reminder.reminder_id);
              }}
              onDelete={() => handleDelete(reminder)}
              editDisabled={pending || channels === null}
              deleteDisabled={pending}
            />
          ),
        )}
      </ul>
    </section>
  );
}
