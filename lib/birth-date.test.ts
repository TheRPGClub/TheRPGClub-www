import { describe, expect, it } from "vitest";

import {
  birthDateLimit,
  birthDateRefusal,
  birthDateRequest,
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

describe("formatBirthDate", () => {
  it("writes a date the way the API's refusal does", () => {
    expect(formatBirthDate("2026-12-01")).toBe("1 December 2026");
    expect(formatBirthDate("1990-05-04")).toBe("4 May 1990");
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
