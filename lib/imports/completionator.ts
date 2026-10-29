import type {
  CompletionatorImportItem,
  CompletionatorImportReview,
  CompletionatorUpdateField,
  GameCompletion,
  ImportReview,
} from "@/lib/api/types";

// Pure helpers for the Completionator review (www#31). Client-safe.

export const COMPLETION_TYPES = [
  "Main Story",
  "Main Story + Side Content",
  "Completionist",
] as const;

// The steps where the row waits for the member. The others (`auto_added`,
// `auto_skipped`, or none) mean the row is done: advance to the next one.
const MEMBER_STEPS = new Set(["choose_game", "add_completion", "confirm_same", "update_completion"]);

// For `perform`'s `show`: the review to display after `match`, or null to
// advance when the API already added or skipped the row.
export function completionatorReviewToShow(
  review: CompletionatorImportReview,
): ImportReview | null {
  return review.item && review.next_step && MEMBER_STEPS.has(review.next_step) ? review : null;
}

// "2024-03-05" from an API date-time. The export's dates have no time of day,
// so the calendar date is all that matters (and it must not shift by zone).
export function datePart(value: string | null | undefined): string | null {
  const match = value ? /^(\d{4}-\d{2}-\d{2})/.exec(value) : null;
  return match ? match[1] : null;
}

export function formatImportDate(value: string | null | undefined): string | null {
  const day = datePart(value);
  if (!day) return null;
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { timeZone: "UTC", dateStyle: "medium" });
}

// Today in the member's own time zone, as YYYY-MM-DD.
export function todayDate(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function formatPlaytime(hours: number | null | undefined): string | null {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return null;
  return `${Number(hours.toFixed(2))} h`;
}

// "" is no playtime; anything else must be a non-negative number.
export function parsePlaytime(text: string): { ok: true; value: number | null } | { ok: false } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, value: null };
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return { ok: false };
  return { ok: true, value: Math.round(value * 100) / 100 };
}

export type DateChoice = "csv" | "today" | "unknown" | "custom";

export interface AddCompletionForm {
  completionType: string;
  // "" records no platform.
  platformId: string;
  dateChoice: DateChoice;
  customDate: string;
  playtime: string;
}

export interface AddCompletionPayload {
  completion_type: string;
  platform_id: number | null;
  completed_at: string | null;
  final_playtime_hours: number | null;
}

// The add_completion body from the form, or an error to show.
export function addCompletionPayload(
  form: AddCompletionForm,
  rowDate: string | null,
): { ok: true; payload: AddCompletionPayload } | { ok: false; error: string } {
  if (!(COMPLETION_TYPES as readonly string[]).includes(form.completionType)) {
    return { ok: false, error: "Choose a completion type." };
  }
  let completedAt: string | null;
  switch (form.dateChoice) {
    case "csv":
      completedAt = datePart(rowDate);
      if (!completedAt) return { ok: false, error: "This row has no date. Choose another option." };
      break;
    case "today":
      completedAt = todayDate();
      break;
    case "custom":
      completedAt = /^\d{4}-\d{2}-\d{2}$/.test(form.customDate) ? form.customDate : null;
      if (!completedAt) return { ok: false, error: "Pick the date you finished it." };
      break;
    default:
      completedAt = null;
  }
  const playtime = parsePlaytime(form.playtime);
  if (!playtime.ok) return { ok: false, error: "Playtime must be a number of hours." };
  const platformId = form.platformId ? Number(form.platformId) : null;

  return {
    ok: true,
    payload: {
      completion_type: form.completionType,
      platform_id: Number.isInteger(platformId) ? platformId : null,
      completed_at: completedAt,
      final_playtime_hours: playtime.value,
    },
  };
}

export const UPDATE_FIELD_LABELS: Record<CompletionatorUpdateField, string> = {
  type: "Completion type",
  date: "Date finished",
  playtime: "Playtime",
};

// [label, current value, value from the file] for the diff view.
export function completionDiffRows(
  existing: GameCompletion,
  item: CompletionatorImportItem,
): [CompletionatorUpdateField, string, string][] {
  const none = "—";
  return [
    ["type", existing.completion_type || none, item.completion_type || none],
    ["date", formatImportDate(existing.completed_at) ?? none, formatImportDate(item.completed_at) ?? none],
    [
      "playtime",
      formatPlaytime(existing.final_playtime_hrs) ?? none,
      formatPlaytime(item.playtime_hrs) ?? none,
    ],
  ];
}
