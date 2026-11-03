import type { BotJob, LiveEvent, LiveEventStatus } from "@/lib/api/types";
import type { BotJobPhase } from "@/lib/bot-jobs";
import { CLUB_TIME_ZONE } from "@/lib/public-reminders";

// Pure helpers for the /admin/live-events tool. The API decides; these keep
// the form honest and the times readable. Limits match the API's (and the
// bot's /mod create-live-event).

export const TOPIC_MAX = 100;
export const IMAGE_URL_MAX = 1000;
// The image goes through a server action, and Vercel refuses a function
// request body over about 4.5 MB before Next sees it, so the cap is 4 MB
// (the API would take 10).
export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES: readonly string[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// For the file picker's `accept`.
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

// The API squishes the topic: trimmed, inner runs of spaces made one.
export function squishTopic(topic: string): string {
  return topic.trim().replace(/\s+/g, " ");
}

// A problem with the picked file, or null when the API will take it.
export function imageFileProblem(file: { type: string; size: number }): string | null {
  if (file.size === 0) return "That file is empty.";
  if (!IMAGE_TYPES.includes(file.type)) return "Use a JPEG, PNG, WebP or GIF image.";
  if (file.size > IMAGE_MAX_BYTES) return "The image is larger than 4 MB. Use a smaller one, or link it by URL.";
  return null;
}

// An http(s) URL, or null.
export function safeImageUrl(value: string): string | null {
  const text = value.trim();
  if (!text || text.length > IMAGE_URL_MAX) return null;
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export interface LiveEventInput {
  topic: string;
  // ISO 8601 instants (with an offset).
  starts_at: string;
  ends_at: string;
  image_url: string | null;
}

// Check a live event the way the API does: a topic of at most 100
// characters, a start in the future, an end after the start, and at most
// one image (a URL or a file, checked by the caller). Returns the clean
// payload or the first problem.
export function validateLiveEventInput(
  raw: { topic: string; starts_at: string | null; ends_at: string | null; image_url: string | null },
  now: number = Date.now(),
): { ok: true; data: LiveEventInput } | { ok: false; error: string } {
  const topic = squishTopic(raw.topic);
  if (!topic) return { ok: false, error: "Give the event a topic." };
  if (topic.length > TOPIC_MAX) return { ok: false, error: `Keep the topic to ${TOPIC_MAX} characters.` };

  const start = raw.starts_at ? Date.parse(raw.starts_at) : NaN;
  if (!raw.starts_at || Number.isNaN(start)) return { ok: false, error: "Pick when it starts." };
  if (start <= now) return { ok: false, error: "The start must be in the future." };
  const end = raw.ends_at ? Date.parse(raw.ends_at) : NaN;
  if (!raw.ends_at || Number.isNaN(end)) return { ok: false, error: "Pick when it ends." };
  if (end <= start) return { ok: false, error: "The end must be after the start." };

  let image_url: string | null = null;
  if (raw.image_url?.trim()) {
    image_url = safeImageUrl(raw.image_url);
    if (!image_url) return { ok: false, error: "The image URL must be an http or https link." };
  }
  return { ok: true, data: { topic, starts_at: raw.starts_at, ends_at: raw.ends_at, image_url } };
}

export interface ClockReading {
  // "21:00" in the viewer's zone.
  time: string;
  // "Sun, Nov 8".
  day: string;
  // "4:00 PM ET", with the club's weekday when its date differs ("Sat 11:00 PM ET").
  club: string;
}

function dateKey(at: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

// A start or end as the form's clocks show it. `timeZone` is the viewer's
// (undefined is the runtime's own), so this is client-only in practice.
export function clockReading(iso: string, timeZone?: string): ClockReading {
  const at = new Date(iso);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(at);
  const day = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(at);
  const clubTime = new Intl.DateTimeFormat("en-US", { timeZone: CLUB_TIME_ZONE, hour: "numeric", minute: "2-digit" }).format(at);
  const sameDay = dateKey(at, timeZone) === dateKey(at, CLUB_TIME_ZONE);
  const clubDay = sameDay
    ? ""
    : `${new Intl.DateTimeFormat("en-US", { timeZone: CLUB_TIME_ZONE, weekday: "short" }).format(at)} `;
  return { time, day, club: `${clubDay}${clubTime} ET` };
}

// "2 h 30", "3 h", "45 min".
export function durationText(startIso: string, endIso: string): string | null {
  const minutes = Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60_000);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

// The event's own progress as a stamp: the thread alone is still waiting
// on the scheduled event.
export function liveEventPhase(status: LiveEventStatus): BotJobPhase {
  if (status === "created") return "done";
  if (status === "failed") return "failed";
  return "queued";
}

export function isLiveEventSettled(event: Pick<LiveEvent, "status">): boolean {
  return liveEventPhase(event.status) !== "queued";
}

export interface LiveEventLinks {
  thread: string | null;
  event: string | null;
}

// The thread and event links: from the ids once the bot recorded them
// (needs the guild id), else from the job's result text, which the bot
// writes as "Thread: <url>\nEvent: <url>".
export function liveEventLinks(
  event: Pick<LiveEvent, "discord_thread_id" | "discord_event_id">,
  guildId: string | null,
  job?: Pick<BotJob, "result_text"> | null,
): LiveEventLinks {
  const fromText = (label: string) => {
    const match = new RegExp(`^${label}:\\s*(https://\\S+)`, "im").exec(job?.result_text ?? "");
    return match ? match[1] : null;
  };
  return {
    thread:
      guildId && event.discord_thread_id
        ? `https://discord.com/channels/${guildId}/${event.discord_thread_id}`
        : fromText("Thread"),
    event:
      guildId && event.discord_event_id
        ? `https://discord.com/events/${guildId}/${event.discord_event_id}`
        : fromText("Event"),
  };
}

// Events that haven't ended yet, for a count on the desk.
export function upcomingCount(events: readonly Pick<LiveEvent, "ends_at">[], now: number = Date.now()): number {
  return events.filter((e) => Date.parse(e.ends_at) > now).length;
}
