// A member's Birth Date (spec api#376, API api#380): the document
// `GET`/`PUT /api/v1/users/:user_id/birth_date` serves, and the helpers
// /settings and the staff desk share to set it. The API owns the rules (the
// two-a-month limit, who may set whose); these only shape the request and
// the words. Client-safe: no server imports here. The club's today is
// `clubToday` in lib/challenges/dates.

export interface BirthDate {
  user_id: string;
  // YYYY-MM-DD, or MM-DD when the member gave only the day and month
  // (api#398); null until the member enters it.
  birth_date: string | null;
  // Whether the member shares their Birthday, the day and month (api#399).
  // Off until they turn it on; removing the Birth Date turns it off.
  birthday_shared: boolean;
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

// A real month and day in MM-DD, checked against leap year 2000 as the API
// does, so 29 February passes and 30 February doesn't.
function isMonthDay(value: string): boolean {
  return /^\d{2}-\d{2}$/.test(value) && isCalendarDate(`2000-${value}`);
}

// The PUT body for a Birth Date ("1990-05-04", or "05-04" without the year),
// or why it can't be sent. `null` removes the Birth Date. `today` is the
// club's date (YYYY-MM-DD), so the form refuses what the API would before
// the round trip.
export function birthDateRequest(value: string | null, today: string): BirthDateRequest {
  if (value === null) return { ok: true, body: { data: { birth_date: null } } };
  const date = value.trim();
  if (date === "") return { ok: false, error: "Enter your Birth Date first." };
  if (isMonthDay(date)) return { ok: true, body: { data: { birth_date: date } } };
  if (!isCalendarDate(date)) return { ok: false, error: "That isn't a date. Pick one from the calendar." };
  if (date > today) return { ok: false, error: "A Birth Date can't be after today." };
  if (date < FIRST_DAY) return { ok: false, error: "A Birth Date must be in 1900 or later." };
  return { ok: true, body: { data: { birth_date: date } } };
}

export const MONTHS = [
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
// one, or "4 May" for a year-less Birth Date ("05-04"). Read from the
// digits, so no time zone can move it a day.
export function formatBirthDate(date: string): string {
  const parts = date.split("-");
  const [month, day] = parts.slice(-2).map(Number);
  const dayMonth = `${day} ${MONTHS[month - 1]}`;
  return parts.length === 3 ? `${dayMonth} ${parts[0]}` : dayMonth;
}

// The birth year a birth-year Run starts at: none for a year-less Birth
// Date, which Challenges count as having no birth year.
export function birthYearOf(date: string | null): number | null {
  const match = date?.match(/^(\d{4})-/);
  return match ? Number(match[1]) : null;
}

// The Birth Date form's three fields: the Day and Month selects ("1" to
// "31", "1" to "12", "" until picked) and the optional Year, as typed.
export interface BirthDateFields {
  day: string;
  month: string;
  year: string;
}

function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

// The form's fields as a Birth Date ("05-04", or "1990-05-04" with a year),
// or why they can't be one. The day and month are required; an empty year
// leaves it out. A dated one keeps the API's range (1900 to `today`).
export function birthDateFromFields(
  fields: BirthDateFields,
  today: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const day = Number(fields.day);
  const month = Number(fields.month);
  if (!fields.day || !fields.month || !(month >= 1 && month <= 12) || !(day >= 1 && day <= 31)) {
    return { ok: false, error: "Pick the day and the month." };
  }
  const year = fields.year.trim();
  if (year !== "" && !/^\d{4}$/.test(year)) {
    return { ok: false, error: "Enter the year as four digits, or leave it empty." };
  }
  const value = `${year ? `${year}-` : ""}${pad(month)}-${pad(day)}`;
  const valid = year ? isCalendarDate(value) : isMonthDay(value);
  if (!valid) {
    return { ok: false, error: `${MONTHS[month - 1]}${year ? ` ${year}` : ""} has no ${ordinal(day)} day.` };
  }
  const request = birthDateRequest(value, today);
  return request.ok ? { ok: true, value } : request;
}

// A served Birth Date ("1990-05-04", "05-04" or none) as the form's fields.
export function birthDateFields(value: string | null): BirthDateFields {
  if (!value) return { day: "", month: "", year: "" };
  const parts = value.split("-");
  const [month, day] = parts.slice(-2).map(Number);
  return { day: String(day), month: String(month), year: parts.length === 3 ? parts[0] : "" };
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
  // `birth_date_required` (sharing without a Birth Date) carries its words in
  // `message`; the other refusals' `error` is the prose.
  const message = typeof fields.message === "string" && fields.message ? fields.message : null;
  const text = message ?? (typeof fields.error === "string" && fields.error ? fields.error : null);
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

export interface BirthdayShareSwitch {
  checked: boolean;
  // No Birth Date: the switch stays in place but does nothing, and `line`
  // says what to do first.
  unavailable: boolean;
  line: string;
}

// The "Share my Birthday" switch on /settings. It needs a Birth Date (the API
// refuses sharing without one) but not its year, and it isn't held by the
// twice-a-month limit: switching sharing never counts toward it.
export function birthdayShareSwitch(doc: BirthDate): BirthdayShareSwitch {
  if (doc.birth_date === null) {
    return { checked: false, unavailable: true, line: "Add your Birth Date's day and month first." };
  }
  return {
    checked: doc.birthday_shared,
    unavailable: false,
    line: "Members see the day and month on your profile and in Upcoming Birthdays, and the bot greets you with a Birthday Post on the day. Never your year or age. Switch it whenever you like.",
  };
}

export interface BirthDateFormControls {
  canSave: boolean;
  canRemove: boolean;
  // The "Share my Birthday" switch waits ("Saving") and ignores flips.
  switchBusy: boolean;
}

// What /settings allows while a save is out. The date and the share switch
// never save at once: answering out of order, one would show a document the
// other has since changed (a share landing after a Remove shows the date
// still set), and a refused share would roll back to a stale value.
export function birthDateFormControls(s: {
  // The fields differ from the stored Birth Date.
  changed: boolean;
  // Day and Month are both picked.
  picked: boolean;
  // Both changes this month are used.
  locked: boolean;
  hasDate: boolean;
  savingDate: boolean;
  savingShare: boolean;
}): BirthDateFormControls {
  const busy = s.savingDate || s.savingShare;
  return {
    canSave: s.changed && s.picked && !s.locked && !busy,
    canRemove: s.hasDate && !s.locked && !busy,
    switchBusy: busy,
  };
}
