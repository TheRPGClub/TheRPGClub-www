import { beforeEach, describe, expect, it, vi } from "vitest";

// The Upcoming Birthdays read is cached per member and tagged; every action
// that changes a Birth Date or its sharing invalidates the tag, so a member
// who stops (or starts) sharing leaves (or joins) everyone's dashboard line
// at once rather than after the cache runs out.

const calls: { path: string; init?: RequestInit }[] = [];
let answer: { status: number; body: unknown } = { status: 200, body: { data: [] } };
const updateTag = vi.fn();

vi.mock("next/cache", () => ({ refresh: vi.fn(), updateTag: (tag: string) => updateTag(tag) }));
vi.mock("@/lib/session", () => ({
  getSession: async () => ({ principal: { discord_id: "111" }, membership: { moderator: true } }),
}));
vi.mock("@/lib/api", () => ({
  apiFetch: async (path: string, init?: RequestInit) => {
    calls.push({ path, init });
    return new Response(JSON.stringify(answer.body), { status: answer.status });
  },
}));

import { BIRTHDAYS_TAG, fetchUpcomingBirthdays } from "./birthdays";
import { saveBirthDateAction, shareBirthdayAction } from "@/app/actions/birth-date";
import { saveMemberBirthDateAction, stopMemberBirthdaySharingAction } from "@/app/actions/member-birth-date";

const DOC = { birth_date: "05-04", birthday_shared: true, changes_left_this_month: 2, next_change_on: null };

beforeEach(() => {
  calls.length = 0;
  updateTag.mockClear();
  answer = { status: 200, body: { data: DOC } };
});

describe("fetchUpcomingBirthdays", () => {
  it("tags the cached read", async () => {
    answer = { status: 200, body: { data: [] } };
    await fetchUpcomingBirthdays();
    expect(calls[0].path).toBe("/api/v1/birthdays/upcoming");
    expect(calls[0].init?.next?.tags).toEqual([BIRTHDAYS_TAG]);
  });

  it("reads the list and ignores the response-level next", async () => {
    const entry = { user_id: "1", display_name: "Ann", month: 5, day: 4, on: "2026-05-04", today: false };
    answer = { status: 200, body: { data: [entry], next: { month: 1, day: 9, on: "2027-01-09" } } };
    expect(await fetchUpcomingBirthdays()).toEqual([entry]);
  });

  it("is null when the read fails", async () => {
    answer = { status: 500, body: { error: "boom" } };
    expect(await fetchUpcomingBirthdays()).toBeNull();
  });
});

describe("Birth Date actions invalidate Upcoming Birthdays", () => {
  it.each([
    ["the member's own date", () => saveBirthDateAction({ birthDate: "05-04" })],
    ["the member's sharing", () => shareBirthdayAction(false)],
    ["staff setting a date", () => saveMemberBirthDateAction({ userId: "222", birthDate: null })],
    ["staff stopping sharing", () => stopMemberBirthdaySharingAction("222")],
  ])("after %s", async (_name, act) => {
    const result = await act();
    expect(result.ok).toBe(true);
    expect(updateTag).toHaveBeenCalledWith(BIRTHDAYS_TAG);
  });

  it("not when the API refuses", async () => {
    answer = { status: 422, body: { error: "birth_date must be a date" } };
    await stopMemberBirthdaySharingAction("222");
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("shareBirthdayAction", () => {
  it.each([null, undefined, "true", 1])("refuses %j without asking the API", async (shared) => {
    const result = await shareBirthdayAction(shared as unknown as boolean);
    expect(result.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });
});
