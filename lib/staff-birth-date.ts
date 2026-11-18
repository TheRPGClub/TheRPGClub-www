// The staff Birth Dates desk (www#118): a member's Birth Date document with
// its sharing, and the words for the sharing row. Staff can stop a member
// sharing their Birthday but never start it (spec api#396); the API refuses
// `birthday_shared: true` from staff with 403, and the desk has no control
// for it. Client-safe.
import { formatBirthDate, type BirthDate } from "@/lib/birth-date";

export interface StaffSharing {
  // What the switch shows.
  shared: boolean;
  // Staff may switch it off; nothing ever lets them switch it on.
  canTurnOff: boolean;
  // The line under the row's name.
  line: string;
}

// The sharing row for the member called `name`.
export function staffSharing(doc: BirthDate, name: string): StaffSharing {
  if (!doc.birth_date) {
    return { shared: false, canTurnOff: false, line: `${name} has no Birth Date, so there's no Birthday to share.` };
  }
  if (!doc.birthday_shared) {
    return {
      shared: false,
      canTurnOff: false,
      line: `Not shared. Only ${name} can turn it on, from their settings or /profile birth-date in Discord.`,
    };
  }
  const dayMonth = formatBirthDate(doc.birth_date.slice(-5));
  return {
    shared: true,
    canTurnOff: true,
    line: `Members see ${dayMonth} on ${name}'s profile and in Upcoming Birthdays, and the bot greets them on the day. Once it's off, only ${name} can turn it back on.`,
  };
}

// The status line after a save: `before` and `after` are the documents
// either side of it.
export function staffSavedLine(before: BirthDate, after: BirthDate): string {
  const stopped = before.birthday_shared && !after.birthday_shared;
  if (!after.birth_date) return stopped ? "Removed. Their Birthday is no longer shared." : "Removed.";
  if (stopped && before.birth_date === after.birth_date) return "Their Birthday is no longer shared.";
  return `Saved: ${formatBirthDate(after.birth_date)}.`;
}
