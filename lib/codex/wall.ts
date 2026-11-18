import { clubDayOf, clubToday, formatDay, type IsoDay } from "@/lib/challenges/dates";
import { LONG_MONTHS, dateParts } from "@/lib/codex/codex-date";
import type { CodexEntry, DatePrecision } from "@/lib/codex/types";

// Small rules shared by the Codex contents page and the Fun Facts wall
// (www#124).

// A card's tilt on the wall, in degrees: from its id, so a card keeps its
// tilt from one visit to the next and when cards around it come and go.
// Between -2.2 and 2.2, never flatter than 0.4 either way.
export function cardTilt(id: number): number {
  const h = Math.imul(id ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  const magnitude = 0.4 + ((h % 1000) / 999) * 1.8;
  const sign = (h >>> 16) & 1 ? 1 : -1;
  return Math.round(sign * magnitude * 10) / 10;
}

// A card's number on the wall, oldest first: "No. 1" is the club's first Fun
// Fact. The wall is newest first, so the count runs down the pages.
export function cardNumber(total: number, page: number, per: number, index: number): number {
  return Math.max(1, total - (page - 1) * per - index);
}

// "1–12 of 42" under a page of the wall.
export function pageRange(total: number, page: number, per: number, shown: number): string {
  if (total === 0 || shown === 0) return `0 of ${total}`;
  const from = (page - 1) * per + 1;
  return `${from}–${from + shown - 1} of ${total}`;
}

// When an entry was added, as the club's day: "today", "yesterday", "15 Nov",
// or "3 Mar 2022" in another year.
export function addedDay(createdAt: string, today: IsoDay = clubToday()): string {
  const day = clubDayOf(createdAt);
  if (day === today) return "today";
  const yesterday = clubToday(new Date(Date.parse(`${today}T12:00:00Z`) - 86_400_000));
  if (day === yesterday) return "yesterday";
  return formatDay(day, today);
}

// The day an entry was added, always with its year: "16 Nov 2026".
export function addedOn(createdAt: string): string {
  const day = clubDayOf(createdAt);
  return `${formatDay(day)} ${day.slice(0, 4)}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// When the Daily Fun Fact went out, in the date label style (1C): "Wed 18
// Nov · 15:00", the bot's posting time in New York on that club day.
export const DAILY_FUN_FACT_TIME = "15:00";

export function dailyLabel(clubDate: string): string {
  const date = dateParts(clubDate);
  if (!date) return DAILY_FUN_FACT_TIME;
  const weekday = WEEKDAYS[new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()];
  return `${weekday} ${date.d} ${SHORT_MONTHS[date.m - 1]} · ${DAILY_FUN_FACT_TIME}`;
}

// The contents page's lead panel (1C): the Daily Fun Fact last posted under
// its heading and day, then the newest Fun Facts for "Another one"; or, with
// none posted, the newest Fun Facts "From the wall".
export interface FactPanel {
  heading: "Daily Fun Fact" | "Fun Fact";
  label: string;
  facts: CodexEntry[];
}

export function factPanel(daily: { fact: CodexEntry; clubDate: string } | null, newest: readonly CodexEntry[]): FactPanel {
  if (daily) {
    const rest = newest.filter((fact) => fact.id !== daily.fact.id);
    return { heading: "Daily Fun Fact", label: dailyLabel(daily.clubDate), facts: [daily.fact, ...rest] };
  }
  return { heading: "Fun Fact", label: newest.length > 0 ? "From the wall" : "None on the wall yet", facts: [...newest] };
}

// When something happened, at the precision the club remembers it: "18
// November 2026", "March 2018" or "2016". Null when it has no date.
export function occurredLabel(occurredOn: string | null, precision: DatePrecision | null): string | null {
  const date = dateParts(occurredOn);
  if (!date || !precision) return null;
  if (precision === "year") return String(date.y);
  const month = LONG_MONTHS[date.m - 1];
  return precision === "month" ? `${month} ${date.y}` : `${date.d} ${month} ${date.y}`;
}

// The wall's `?page=`: a whole number from 1, else the first page.
export function pageParam(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 && page <= 100_000 ? page : 1;
}
