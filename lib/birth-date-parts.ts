// The Birth Date form's Day, Month and optional Year (spec api#396, ADR
// 0011): a browser date field can't leave the year out. The parts are what
// the selects and the year field hold; `birthDateValue` turns them into what
// `PUT /users/:id/birth_date` takes ("1990-05-04", or "05-04" without the
// year). Client-safe. Written for the staff desk (www#118) and meant to be
// shared with /settings (www#117).

export interface BirthDateParts {
  // "01" to "31"; "" until picked.
  day: string;
  // "01" to "12"; "" until picked.
  month: string;
  // As typed; "" leaves the year out.
  year: string;
}

export const MONTH_NAMES = [
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

// February has 29: without a year, 29 February is a Birthday like any other.
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// The API's own range for a year: 1900 to today.
const FIRST_DAY = "1900-01-01";

export function daysInMonth(month: string): number {
  return DAYS_IN[Number(month) - 1] ?? 31;
}

// A served Birth Date ("1990-05-04", "05-04" or null) as the form's parts.
export function birthDateParts(value: string | null): BirthDateParts {
  if (!value) return { day: "", month: "", year: "" };
  const pieces = value.split("-");
  const [year, month, day] = pieces.length === 3 ? pieces : ["", ...pieces];
  return { day, month, year };
}

// One part changed. A month shorter than the picked day pulls the day back
// to its last, as the Season edge editor does.
export function setBirthDatePart(
  parts: BirthDateParts,
  field: keyof BirthDateParts,
  value: string,
): BirthDateParts {
  const next = { ...parts, [field]: value };
  if (field === "month" && next.day && Number(next.day) > daysInMonth(value)) {
    next.day = String(daysInMonth(value)).padStart(2, "0");
  }
  return next;
}

// "4 May 1990", or "4 May" without the year. Read from the digits, so no
// time zone can move it a day.
export function birthDateWords(value: string): string {
  const { day, month, year } = birthDateParts(value);
  const words = `${Number(day)} ${MONTH_NAMES[Number(month) - 1]}`;
  return year ? `${words} ${year}` : words;
}

function isCalendarDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export type BirthDateValue = { ok: true; value: string } | { ok: false; error: string };

// The value to send for the form's parts, or why it can't be sent. `today`
// is the club's date (YYYY-MM-DD), so the form refuses what the API would
// before the round trip.
export function birthDateValue(parts: BirthDateParts, today: string): BirthDateValue {
  const { day, month } = parts;
  const year = parts.year.trim();
  if (!day || !month) return { ok: false, error: "Pick the day and the month. The year is optional." };
  if (Number(day) > daysInMonth(month)) {
    return { ok: false, error: `${MONTH_NAMES[Number(month) - 1]} has no day ${Number(day)}.` };
  }
  if (!year) return { ok: true, value: `${month}-${day}` };
  if (!/^\d{4}$/.test(year)) return { ok: false, error: "Enter the year as four digits, or leave it empty." };

  const value = `${year}-${month}-${day}`;
  if (!isCalendarDate(value)) {
    return { ok: false, error: `${birthDateWords(value)} isn't a date: ${year} isn't a leap year.` };
  }
  if (value > today) return { ok: false, error: "A Birth Date can't be after today." };
  if (value < FIRST_DAY) return { ok: false, error: "A Birth Date must be in 1900 or later." };
  return { ok: true, value };
}
