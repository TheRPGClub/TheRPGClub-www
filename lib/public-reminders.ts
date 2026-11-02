import type { PublicReminder, PublicReminderRecurUnit } from "@/lib/api/types";

// Pure helpers for the /admin/reminders tool. The API decides; these keep
// the form honest and the times readable.

// The club's own clock: the bot reads and shows reminder times in it.
export const CLUB_TIME_ZONE = "America/New_York";

// The same units, in the same order, as the bot's /publicreminder recurunit.
export const RECURRENCE_UNITS: readonly {
  value: PublicReminderRecurUnit;
  label: string;
}[] = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export function isRecurUnit(value: unknown): value is PublicReminderRecurUnit {
  return RECURRENCE_UNITS.some((u) => u.value === value);
}

// "repeats every 2 weeks", or null for a one-off. Same words as the bot.
export function recurrenceLabel(
  reminder: Pick<PublicReminder, "recur_every" | "recur_unit">,
): string | null {
  if (!reminder.recur_every || !reminder.recur_unit) return null;
  return `repeats every ${reminder.recur_every} ${reminder.recur_unit}`;
}

function pad(n: number): string {
  return String(Math.abs(n)).padStart(2, "0");
}

// A datetime-local value ("2026-11-02T21:30") for an instant, in the
// browser's zone. Client-only: the server's zone isn't the admin's.
export function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

// A datetime-local value read in the browser's zone, as ISO 8601 with that
// zone's offset ("2026-11-02T21:30:00-05:00"). Null when it isn't a real
// time. Client-only, like toLocalInputValue.
export function localInputToOffsetIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const date = new Date(y, mo - 1, d, h, mi);
  if (Number.isNaN(date.getTime())) return null;
  // getTimezoneOffset is minutes behind UTC, so -300 means UTC-05:00.
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00` +
    `${sign}${pad(Math.trunc(offset / 60))}:${pad(offset % 60)}`
  );
}

// "Mon, Nov 2, 2026, 9:30 PM EST" in the given zone, or the browser's when
// none is given.
export function formatReminderTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

export interface ReminderInput {
  channel_id: string;
  message: string;
  due_at: string;
  recur_every: number | null;
  recur_unit: PublicReminderRecurUnit | null;
}

// Check a reminder the way the bot's /publicreminder create does: a
// channel, a message, a time in the future, and a recurrence that is either
// off or a positive whole number with a unit. Returns the clean payload or
// the first problem.
export function validateReminderInput(
  raw: {
    channel_id: string;
    message: string;
    due_at: string | null;
    recur_every: string | number | null;
    recur_unit: string | null;
  },
  now: number = Date.now(),
): { ok: true; data: ReminderInput } | { ok: false; error: string } {
  const channel_id = raw.channel_id.trim();
  if (!channel_id) return { ok: false, error: "Pick a channel." };

  const message = raw.message.trim();
  if (!message) return { ok: false, error: "Message can't be empty." };

  const due = raw.due_at ? Date.parse(raw.due_at) : NaN;
  if (!raw.due_at || Number.isNaN(due)) {
    return { ok: false, error: "Pick a date and time." };
  }
  if (due <= now) {
    return { ok: false, error: "The reminder time must be in the future." };
  }

  const everyText =
    raw.recur_every === null ? "" : String(raw.recur_every).trim();
  const unit = raw.recur_unit?.trim() || null;
  if (!everyText && !unit) {
    return {
      ok: true,
      data: {
        channel_id,
        message,
        due_at: raw.due_at,
        recur_every: null,
        recur_unit: null,
      },
    };
  }
  const every = Number(everyText);
  if (!Number.isInteger(every) || every <= 0) {
    return {
      ok: false,
      error: "Repeat every must be a positive whole number.",
    };
  }
  if (!isRecurUnit(unit)) {
    return { ok: false, error: "Pick how often it repeats." };
  }
  return {
    ok: true,
    data: {
      channel_id,
      message,
      due_at: raw.due_at,
      recur_every: every,
      recur_unit: unit,
    },
  };
}
