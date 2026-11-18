import { describe, expect, it } from "vitest";

import {
  birthDateFields,
  birthDateFromFields,
  birthDateLimit,
  birthDateRefusal,
  birthDateRequest,
  birthYearOf,
  birthdayShareSwitch,
  formatBirthDate,
  memberChangesLine,
  type BirthDate,
} from "@/lib/birth-date";

describe("birthDateRequest", () => {
  const today = "2026-11-17";

  it("sends a picked date as the PUT body", () => {
    expect(birthDateRequest("1990-05-04", today)).toEqual({
      ok: true,
      body: { data: { birth_date: "1990-05-04" } },
    });
  });

  it("sends null to remove the Birth Date", () => {
    expect(birthDateRequest(null, today)).toEqual({ ok: true, body: { data: { birth_date: null } } });
  });

  it("refuses an empty field rather than removing by accident", () => {
    expect(birthDateRequest("  ", today)).toEqual({ ok: false, error: "Enter your Birth Date first." });
  });

  it("refuses what isn't a calendar date", () => {
    expect(birthDateRequest("1990-02-30", today).ok).toBe(false);
    expect(birthDateRequest("4 May 1990", today).ok).toBe(false);
  });

  it("sends a year-less day and month as MM-DD", () => {
    expect(birthDateRequest("05-04", today)).toEqual({ ok: true, body: { data: { birth_date: "05-04" } } });
  });

  it("takes 29 February without a year but not an impossible day and month", () => {
    expect(birthDateRequest("02-29", today).ok).toBe(true);
    expect(birthDateRequest("02-30", today).ok).toBe(false);
    expect(birthDateRequest("04-31", today).ok).toBe(false);
    expect(birthDateRequest("13-01", today).ok).toBe(false);
  });

  it("refuses a date after today or before 1900, as the API does", () => {
    expect(birthDateRequest("2026-11-18", today)).toEqual({
      ok: false,
      error: "A Birth Date can't be after today.",
    });
    expect(birthDateRequest("1899-12-31", today)).toEqual({
      ok: false,
      error: "A Birth Date must be in 1900 or later.",
    });
    expect(birthDateRequest("1900-01-01", today).ok).toBe(true);
    expect(birthDateRequest("2026-11-17", today).ok).toBe(true);
  });
});

describe("birthDateFromFields", () => {
  const today = "2026-11-17";
  const fields = (day: string, month: string, year = "") => ({ day, month, year });

  it("makes a year-less Birth Date from the day and month alone", () => {
    expect(birthDateFromFields(fields("4", "5"), today)).toEqual({ ok: true, value: "05-04" });
    expect(birthDateFromFields(fields("29", "2"), today)).toEqual({ ok: true, value: "02-29" });
  });

  it("leaves the year out when the Year field holds only spaces", () => {
    expect(birthDateFromFields(fields("4", "5", " "), today)).toEqual({ ok: true, value: "05-04" });
  });

  it("adds the year when one is entered, ignoring spaces around it", () => {
    expect(birthDateFromFields(fields("4", "5", " 1990 "), today)).toEqual({ ok: true, value: "1990-05-04" });
  });

  it("needs both the day and the month", () => {
    const error = "Pick the day and the month.";
    expect(birthDateFromFields(fields("", "5"), today)).toEqual({ ok: false, error });
    expect(birthDateFromFields(fields("4", ""), today)).toEqual({ ok: false, error });
    expect(birthDateFromFields(fields("", "", "1990"), today)).toEqual({ ok: false, error });
  });

  it("names a day the month doesn't have", () => {
    expect(birthDateFromFields(fields("31", "4"), today)).toEqual({ ok: false, error: "April has no 31st day." });
    expect(birthDateFromFields(fields("30", "2"), today)).toEqual({ ok: false, error: "February has no 30th day." });
    expect(birthDateFromFields(fields("29", "2", "1991"), today)).toEqual({
      ok: false,
      error: "February 1991 has no 29th day.",
    });
    expect(birthDateFromFields(fields("29", "2", "1992"), today).ok).toBe(true);
  });

  it("wants a four-digit year or none", () => {
    const error = "Enter the year as four digits, or leave it empty.";
    expect(birthDateFromFields(fields("4", "5", "90"), today)).toEqual({ ok: false, error });
    expect(birthDateFromFields(fields("4", "5", "199O"), today)).toEqual({ ok: false, error });
  });

  it("keeps the API's range for a dated Birth Date", () => {
    expect(birthDateFromFields(fields("18", "11", "2026"), today)).toEqual({
      ok: false,
      error: "A Birth Date can't be after today.",
    });
    expect(birthDateFromFields(fields("31", "12", "1899"), today)).toEqual({
      ok: false,
      error: "A Birth Date must be in 1900 or later.",
    });
    expect(birthDateFromFields(fields("17", "11", "2026"), today)).toEqual({ ok: true, value: "2026-11-17" });
    expect(birthDateFromFields(fields("1", "1", "1900"), today)).toEqual({ ok: true, value: "1900-01-01" });
  });
});

describe("birthDateFields", () => {
  it("loads a full Birth Date into the day, month and year", () => {
    expect(birthDateFields("1990-05-04")).toEqual({ day: "4", month: "5", year: "1990" });
  });

  it("leaves the year empty for a year-less one", () => {
    expect(birthDateFields("12-25")).toEqual({ day: "25", month: "12", year: "" });
  });

  it("starts empty without a Birth Date", () => {
    expect(birthDateFields(null)).toEqual({ day: "", month: "", year: "" });
  });
});

describe("formatBirthDate", () => {
  it("writes a date the way the API's refusal does", () => {
    expect(formatBirthDate("2026-12-01")).toBe("1 December 2026");
    expect(formatBirthDate("1990-05-04")).toBe("4 May 1990");
  });

  it("writes a year-less Birth Date as its day and month", () => {
    expect(formatBirthDate("05-04")).toBe("4 May");
    expect(formatBirthDate("02-29")).toBe("29 February");
  });
});

describe("birthYearOf", () => {
  it("reads the birth year of a dated Birth Date", () => {
    expect(birthYearOf("1990-05-04")).toBe(1990);
  });

  it("has none for a year-less Birth Date or none at all", () => {
    expect(birthYearOf("05-04")).toBeNull();
    expect(birthYearOf(null)).toBeNull();
  });
});

describe("birthDateRefusal", () => {
  it("shows the API's limit refusal, which names the date", () => {
    const body = { error: "You can change it again on 1 December 2026.", next_change_on: "2026-12-01" };
    expect(birthDateRefusal(422, body)).toEqual({
      error: "You can change it again on 1 December 2026.",
      nextChangeOn: "2026-12-01",
    });
  });

  it("builds the date from next_change_on when the refusal has no words", () => {
    expect(birthDateRefusal(422, { next_change_on: "2026-12-01" })).toEqual({
      error: "You've changed your Birth Date twice this month. You can change it again on 1 December 2026.",
      nextChangeOn: "2026-12-01",
    });
  });

  it("shows the message of a refusal to share without a Birth Date", () => {
    const body = { error: "birth_date_required", message: "Enter your Birth Date before you share your Birthday." };
    expect(birthDateRefusal(422, body)).toEqual({
      error: "Enter your Birth Date before you share your Birthday.",
      nextChangeOn: null,
    });
  });

  it("names the other refusals in plain words", () => {
    expect(birthDateRefusal(401, null).error).toBe("Sign in again to change a Birth Date.");
    expect(birthDateRefusal(403, { error: "forbidden" }).error).toBe(
      "Only staff can set another member's Birth Date.",
    );
    expect(birthDateRefusal(404, { error: "not_found" }).error).toBe(
      "That member isn't in the club's member list.",
    );
    expect(birthDateRefusal(422, { error: "Birth date can't be in the future" })).toEqual({
      error: "Birth date can't be in the future",
      nextChangeOn: null,
    });
    expect(birthDateRefusal(500, null).error).toBe("Couldn't save the Birth Date (HTTP 500). Try again.");
  });
});

describe("birthDateLimit", () => {
  const doc = (changes_left_this_month: number, next_change_on: string | null = null): BirthDate => ({
    user_id: "1",
    birth_date: "1990-05-04",
    birthday_shared: false,
    changes_left_this_month,
    next_change_on,
  });

  it("counts the member's changes left this month", () => {
    expect(birthDateLimit(doc(2), false)).toEqual({
      locked: false,
      line: "You can set or change it twice more this month.",
    });
    expect(birthDateLimit(doc(1), false)).toEqual({
      locked: false,
      line: "You can change it once more this month.",
    });
  });

  it("locks the field with the date it opens again once both are used", () => {
    expect(birthDateLimit(doc(0, "2026-12-01"), false)).toEqual({
      locked: true,
      line: "You've changed it twice this month. You can change it again on 1 December 2026.",
    });
  });

  it("never locks it for staff, whose changes don't count", () => {
    expect(birthDateLimit(doc(0, "2026-12-01"), true)).toEqual({
      locked: false,
      line: "Staff changes don't count toward the two a month.",
    });
  });
});

describe("memberChangesLine", () => {
  const doc = (left: number, next: string | null = null, date: string | null = "1990-05-04"): BirthDate => ({
    user_id: "1",
    birth_date: date,
    birthday_shared: false,
    changes_left_this_month: left,
    next_change_on: next,
  });

  it("tells staff what the member has left of their own changes", () => {
    expect(memberChangesLine(doc(2))).toBe("Their own changes left this month: 2.");
    expect(memberChangesLine(doc(1))).toBe("Their own changes left this month: 1.");
    expect(memberChangesLine(doc(0, "2026-12-01"))).toBe(
      "They've used both of their own changes this month, until 1 December 2026.",
    );
  });

  it("says when the member hasn't entered one", () => {
    expect(memberChangesLine(doc(2, null, null))).toBe("No Birth Date yet. Their own changes left this month: 2.");
  });
});

describe("birthdayShareSwitch", () => {
  const doc = (over: Partial<BirthDate>): BirthDate => ({
    user_id: "1",
    birth_date: "05-04",
    birthday_shared: false,
    changes_left_this_month: 2,
    next_change_on: null,
    ...over,
  });
  const SHARE_LINE =
    "Members see the day and month on your profile and in Upcoming Birthdays, and the bot greets you with a Birthday Post on the day. Never your year or age. Switch it whenever you like.";

  it("follows birthday_shared once there is a Birth Date, with or without its year", () => {
    expect(birthdayShareSwitch(doc({ birthday_shared: true }))).toEqual({
      checked: true,
      unavailable: false,
      line: SHARE_LINE,
    });
    expect(birthdayShareSwitch(doc({ birth_date: "1990-05-04" }))).toEqual({
      checked: false,
      unavailable: false,
      line: SHARE_LINE,
    });
  });

  it("is off and unavailable, saying what to do first, without a Birth Date", () => {
    expect(birthdayShareSwitch(doc({ birth_date: null }))).toEqual({
      checked: false,
      unavailable: true,
      line: "Add your Birth Date's day and month first.",
    });
  });

  it("keeps working when the Birth Date is locked at the limit", () => {
    const locked = doc({ birthday_shared: true, changes_left_this_month: 0, next_change_on: "2026-12-01" });
    expect(birthdayShareSwitch(locked)).toEqual({ checked: true, unavailable: false, line: SHARE_LINE });
  });
});
