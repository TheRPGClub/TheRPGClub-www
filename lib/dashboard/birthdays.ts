import type { UpcomingBirthday } from "@/lib/api/birthdays";
import { birthdayLabel } from "@/lib/birthday";
import { daysBetween, type IsoDay } from "@/lib/challenges/dates";

// The dashboard's Upcoming Birthdays line (spec api#396, design pick C): one
// ruled contents line under Previous rounds, today's Birthdays marked out.
// Pure: the caller passes the club's today (`clubToday`).

export interface BirthdayLineEntry {
  userId: string;
  name: string;
  // Their Discord avatar hash, for the picture (memberPictureSrc).
  discordAvatar: string | null;
  // "Today", "Tomorrow" or the day it falls on ("Sat 21 Nov").
  when: string;
  today: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Sat 21 Nov" for a club day. A 29 February Birthday moved to 28 February
// is dated by the day it falls on.
function dayLabel(on: IsoDay): string {
  const [year, month, day] = on.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${weekday} ${birthdayLabel({ month, day })}`;
}

// The line's entries, or null when it is hidden: nobody's Birthday is
// coming up, or the read failed. Today is the club's, not the read's, so a
// cached read left over from yesterday drops the day that has passed.
export function birthdayLine(
  birthdays: UpcomingBirthday[] | null,
  today: IsoDay,
): BirthdayLineEntry[] | null {
  const entries = (birthdays ?? []).flatMap((b) => {
    const days = daysBetween(today, b.on);
    if (days < 0) return [];
    const when = days === 0 ? "Today" : days === 1 ? "Tomorrow" : dayLabel(b.on);
    return [{ userId: b.user_id, name: b.display_name, discordAvatar: b.discord_avatar ?? null, when, today: days === 0 }];
  });
  return entries.length > 0 ? entries : null;
}
