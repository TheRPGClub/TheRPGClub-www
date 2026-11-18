// A member's Birth Date (spec api#376, API api#380): the document
// `GET`/`PUT /api/v1/users/:user_id/birth_date` serves, and the helpers
// /settings and the staff desk share to set it. The API owns the rules (the
// two-a-month limit, who may set whose); these only shape the request and
// the words. Client-safe: no server imports here. The club's today is
// `clubToday` in lib/challenges/dates.

export interface BirthDate {
  user_id: string;
  // YYYY-MM-DD; null until the member enters it.
  birth_date: string | null;
  // 0 to 2: how many more times the member may set or change it this
  // calendar month (US Eastern). Staff changes don't count.
  changes_left_this_month: number;
  // When changes_left_this_month is 0: the first day of next month.
  next_change_on: string | null;
}

export interface BirthDateBody {
  data: { birth_date: string | null };
}

export type BirthDateRequest = { ok: true; body: BirthDateBody } | { ok: false; error: string };

// The API's own range: from 1900 to today.
const FIRST_DAY = "1900-01-01";

// A real calendar date in YYYY-MM-DD (not 30 February).
function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// The PUT body for a date field's value, or why it can't be sent. `null`
// removes the Birth Date. `today` is the club's date (YYYY-MM-DD), so the
// field refuses what the API would before the round trip.
export function birthDateRequest(value: string | null, today: string): BirthDateRequest {
  if (value === null) return { ok: true, body: { data: { birth_date: null } } };
  const date = value.trim();
  if (date === "") return { ok: false, error: "Enter your Birth Date first." };
  if (!isCalendarDate(date)) return { ok: false, error: "That isn't a date. Pick one from the calendar." };
  if (date > today) return { ok: false, error: "A Birth Date can't be after today." };
  if (date < FIRST_DAY) return { ok: false, error: "A Birth Date must be in 1900 or later." };
  return { ok: true, body: { data: { birth_date: date } } };
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// "4 May 1990": a date-only value written the way the API's refusal writes
// one. Read from the digits, so no time zone can move it a day.
export function formatBirthDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export interface BirthDateRefusal {
  error: string;
  // Only for the limit: the first day of next month.
  nextChangeOn: string | null;
}

// A refused PUT in words. The limit's 422 carries prose that names the date
// it opens again (`error`) and `next_change_on`; the range refusals are prose
// too. `body` is the parsed JSON body, or null when there was none.
export function birthDateRefusal(status: number, body: unknown): BirthDateRefusal {
  const fields = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const text = typeof fields.error === "string" && fields.error ? fields.error : null;
  const nextChangeOn = typeof fields.next_change_on === "string" ? fields.next_change_on : null;

  if (status === 401) return { error: "Sign in again to change a Birth Date.", nextChangeOn: null };
  if (status === 403) return { error: "Only staff can set another member's Birth Date.", nextChangeOn: null };
  if (status === 404) return { error: "That member isn't in the club's member list.", nextChangeOn: null };
  if (status === 422 && nextChangeOn) {
    return {
      error:
        text ??
        `You've changed your Birth Date twice this month. You can change it again on ${formatBirthDate(nextChangeOn)}.`,
      nextChangeOn,
    };
  }
  if (status === 422 && text) return { error: text, nextChangeOn: null };
  return { error: `Couldn't save the Birth Date (HTTP ${status}). Try again.`, nextChangeOn: null };
}

export interface BirthDateLimit {
  // The member used both changes this month: the field can't be saved.
  locked: boolean;
  line: string;
}

// The line under the field: the member's changes left this month, or when
// it opens again. Staff are never limited (the API doesn't count their
// changes, their own included), so it never locks for them.
export function birthDateLimit(doc: BirthDate, staff: boolean): BirthDateLimit {
  if (staff) return { locked: false, line: "Staff changes don't count toward the two a month." };
  const left = doc.changes_left_this_month;
  if (left >= 2) return { locked: false, line: "You can set or change it twice more this month." };
  if (left === 1) return { locked: false, line: "You can change it once more this month." };
  const opens = doc.next_change_on ? ` You can change it again on ${formatBirthDate(doc.next_change_on)}.` : "";
  return { locked: true, line: `You've changed it twice this month.${opens}` };
}

// For staff setting another member's: what the member has left of their own
// changes this month (staff changes never use them up).
export function memberChangesLine(doc: BirthDate): string {
  const none = doc.birth_date === null ? "No Birth Date yet. " : "";
  if (doc.changes_left_this_month > 0) {
    return `${none}Their own changes left this month: ${doc.changes_left_this_month}.`;
  }
  const until = doc.next_change_on ? `, until ${formatBirthDate(doc.next_change_on)}` : "";
  return `${none}They've used both of their own changes this month${until}.`;
}
