import { describe, expect, it } from "vitest";

import { birthdayLabel, isBirthdayToday, profileBirthday } from "@/lib/birthday";

describe("isBirthdayToday", () => {
  it("is true on the Birthday's day and month in the club's year", () => {
    expect(isBirthdayToday({ month: 11, day: 18 }, "2026-11-18")).toBe(true);
  });

  it("is false on any other day", () => {
    expect(isBirthdayToday({ month: 11, day: 18 }, "2026-11-19")).toBe(false);
    expect(isBirthdayToday({ month: 10, day: 18 }, "2026-11-18")).toBe(false);
  });

  it("keeps 29 February to leap years and moves it to 28 February in the others", () => {
    const leapDay = { month: 2, day: 29 };
    expect(isBirthdayToday(leapDay, "2028-02-29")).toBe(true);
    expect(isBirthdayToday(leapDay, "2028-02-28")).toBe(false);
    expect(isBirthdayToday(leapDay, "2027-02-28")).toBe(true);
    expect(isBirthdayToday(leapDay, "2027-03-01")).toBe(false);
    expect(isBirthdayToday(leapDay, "2100-02-28")).toBe(true);
  });

  it("still holds a 28 February Birthday to 28 February", () => {
    expect(isBirthdayToday({ month: 2, day: 28 }, "2028-02-28")).toBe(true);
    expect(isBirthdayToday({ month: 2, day: 28 }, "2028-02-29")).toBe(false);
  });
});

describe("birthdayLabel", () => {
  it("is the day and the short month, with no year", () => {
    expect(birthdayLabel({ month: 11, day: 21 })).toBe("21 Nov");
    expect(birthdayLabel({ month: 5, day: 4 })).toBe("4 May");
    expect(birthdayLabel({ month: 2, day: 29 })).toBe("29 Feb");
  });
});

describe("profileBirthday", () => {
  it("is the label and whether it is today, for a shared Birthday", () => {
    expect(profileBirthday({ month: 11, day: 21 }, "2026-11-18")).toEqual({ label: "21 Nov", today: false });
    expect(profileBirthday({ month: 11, day: 18 }, "2026-11-18")).toEqual({ label: "18 Nov", today: true });
  });

  it("is nothing when the Birthday isn't shared, or the API leaves it out", () => {
    expect(profileBirthday(null, "2026-11-18")).toBeNull();
    expect(profileBirthday(undefined, "2026-11-18")).toBeNull();
  });
});
