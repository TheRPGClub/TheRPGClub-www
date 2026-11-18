import type { IsoDay } from "@/lib/challenges/dates";

// A member's shared Birthday (spec api#396, API api#399): the day and month
// of their Birth Date, never the year. Client-safe and pure: callers pass
// the club's today (`clubToday` in lib/challenges/dates).

export interface Birthday {
  month: number;
  day: number;
}

function isLeap(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Whether `today` (the club's day, YYYY-MM-DD) is the Birthday. A 29
// February Birthday falls on 28 February in a year without one, as the
// Birthday Post reads it.
export function isBirthdayToday(birthday: Birthday, today: IsoDay): boolean {
  const [year, month, day] = today.split("-").map(Number);
  const leapDayMoved = birthday.month === 2 && birthday.day === 29 && !isLeap(year);
  const celebrated = leapDayMoved ? 28 : birthday.day;
  return birthday.month === month && celebrated === day;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "21 Nov": the Birthday in words, day first as the club writes dates.
export function birthdayLabel(birthday: Birthday): string {
  return `${birthday.day} ${MONTHS[birthday.month - 1]}`;
}

// What a profile shows of the member's Birthday: nothing unless they share
// it (the profile's `birthday` is null then, and an older API leaves it
// out), else the day and month and whether it is the day.
export interface ProfileBirthday {
  label: string;
  today: boolean;
}

export function profileBirthday(birthday: Birthday | null | undefined, today: IsoDay): ProfileBirthday | null {
  if (!birthday) return null;
  return { label: birthdayLabel(birthday), today: isBirthdayToday(birthday, today) };
}
