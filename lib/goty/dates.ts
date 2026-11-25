// Dates on /goty, in the club's zone (the API schedules the GOTY Vote in
// America/New_York, as it does GOTM rounds).

const ZONE = "America/New_York";

function parts(iso: string, options: Intl.DateTimeFormatOptions) {
  const list = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, ...options }).formatToParts(new Date(iso));
  return (type: string) => list.find((p) => p.type === type)?.value ?? "";
}

// "Fri 15 Jan, 12:00 PM ET"
export function etDateTime(iso: string): string {
  const get = parts(iso, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")} ${get("dayPeriod")} ET`;
}

// "Fri 15 Jan 2027, 12:00 PM ET": for a date read away from the banner's
// countdown, where "Fri 1 Jan" alone could be last January or next.
export function etDateTimeYear(iso: string): string {
  const get = parts(iso, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} ${get("dayPeriod")} ET`;
}

// "Fri 15 Jan"
export function etDay(iso: string): string {
  const get = parts(iso, { weekday: "short", day: "numeric", month: "short" });
  return `${get("weekday")} ${get("day")} ${get("month")}`;
}

// "Mon 18 Jan 2027"
export function etDayYear(iso: string): string {
  const get = parts(iso, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("year")}`;
}

// "15 Jan"
export function etShort(iso: string): string {
  const get = parts(iso, { day: "numeric", month: "short" });
  return `${get("day")} ${get("month")}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// A release date at the precision the API knows it: "Mar 2026", "2026".
export function releaseLabel(date: string, precision?: string | null): string {
  const [year, month] = date.split("-");
  if (precision === "year" || !month) return year;
  if (precision === "quarter") return `Q${Math.floor((Number(month) - 1) / 3) + 1} ${year}`;
  return `${MONTHS[Number(month) - 1] ?? ""} ${year}`.trim();
}

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
