import { apiFetch } from "@/lib/api";
import type { ChallengeMember } from "@/lib/challenges/types";

// Upcoming Birthdays (spec api#396, API api#400, `GET /birthdays/upcoming`):
// the shared Birthdays falling from today through today + 29 club days,
// soonest first. Birthdays aren't a Feature, so nothing gates the read.

export interface UpcomingBirthday extends ChallengeMember {
  display_name: string;
  // The Birthday's day and month (2 / 29 even when it falls on 28 February).
  month: number;
  day: number;
  // The club day (YYYY-MM-DD) it falls on this time.
  on: string;
  today: boolean;
}

// The cache tag. Every action that changes a Birth Date or its sharing
// (app/actions/birth-date.ts, member-birth-date.ts) calls
// `updateTag(BIRTHDAYS_TAG)`, which drops every member's copy at once.
export const BIRTHDAYS_TAG = "birthdays";

// Data Cache keys include the member's Authorization, so each member has
// their own copy. Five minutes covers what no action here changes (a member
// leaving the club); the line drops a day that has passed by itself
// (lib/dashboard/birthdays).
const FETCH: RequestInit = { next: { revalidate: 300, tags: [BIRTHDAYS_TAG] } };

// null when the read failed: the dashboard then leaves the line out.
export async function fetchUpcomingBirthdays(): Promise<UpcomingBirthday[] | null> {
  try {
    const res = await apiFetch("/api/v1/birthdays/upcoming", FETCH);
    if (!res.ok) return null;
    // The response also carries `next` (the next shared Birthday past the
    // 30 days), which the dashboard has no use for.
    const body: { data: UpcomingBirthday[] } = await res.json();
    return body.data;
  } catch {
    return null;
  }
}
