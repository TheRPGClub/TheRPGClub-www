import { describe, expect, it } from "vitest";

import {
  birthDateParts,
  birthDateValue,
  birthDateWords,
  daysInMonth,
  setBirthDatePart,
  type BirthDateParts,
} from "@/lib/birth-date-parts";

const parts = (day: string, month: string, year = ""): BirthDateParts => ({ day, month, year });

describe("birthDateParts", () => {
  it("splits a full Birth Date into day, month and year", () => {
    expect(birthDateParts("1990-05-04")).toEqual(parts("04", "05", "1990"));
  });

  it("leaves the year empty for a Birth Date without one", () => {
    expect(birthDateParts("05-04")).toEqual(parts("04", "05"));
  });

  it("is empty without a Birth Date", () => {
    expect(birthDateParts(null)).toEqual(parts("", ""));
  });
});

describe("daysInMonth", () => {
  it("counts 29 days in February, since the year may be left out", () => {
    expect(daysInMonth("02")).toBe(29);
    expect(daysInMonth("04")).toBe(30);
    expect(daysInMonth("12")).toBe(31);
  });

  it("offers every day before a month is picked", () => {
    expect(daysInMonth("")).toBe(31);
  });
});

describe("setBirthDatePart", () => {
  it("sets one part", () => {
    expect(setBirthDatePart(parts("04", "05"), "year", "1990")).toEqual(parts("04", "05", "1990"));
  });

  it("pulls the day back into a shorter month", () => {
    expect(setBirthDatePart(parts("31", "01"), "month", "04")).toEqual(parts("30", "04"));
    expect(setBirthDatePart(parts("31", "01"), "month", "02")).toEqual(parts("29", "02"));
  });
});

describe("birthDateValue", () => {
  const today = "2026-11-18";

  it("sends a full date as YYYY-MM-DD", () => {
    expect(birthDateValue(parts("04", "05", "1990"), today)).toEqual({ ok: true, value: "1990-05-04" });
  });

  it("sends MM-DD when the year is left empty", () => {
    expect(birthDateValue(parts("04", "05", " "), today)).toEqual({ ok: true, value: "05-04" });
    expect(birthDateValue(parts("29", "02"), today)).toEqual({ ok: true, value: "02-29" });
  });

  it("needs the day and the month", () => {
    const error = "Pick the day and the month. The year is optional.";
    expect(birthDateValue(parts("", "05", "1990"), today)).toEqual({ ok: false, error });
    expect(birthDateValue(parts("04", ""), today)).toEqual({ ok: false, error });
  });

  it("refuses a year that isn't four digits", () => {
    expect(birthDateValue(parts("04", "05", "90"), today)).toEqual({
      ok: false,
      error: "Enter the year as four digits, or leave it empty.",
    });
  });

  it("refuses 29 February in a year without one", () => {
    expect(birthDateValue(parts("29", "02", "1991"), today)).toEqual({
      ok: false,
      error: "29 February 1991 isn't a date: 1991 isn't a leap year.",
    });
  });

  it("refuses a date after today or before 1900, as the API does", () => {
    expect(birthDateValue(parts("19", "11", "2026"), today)).toEqual({
      ok: false,
      error: "A Birth Date can't be after today.",
    });
    expect(birthDateValue(parts("31", "12", "1899"), today)).toEqual({
      ok: false,
      error: "A Birth Date must be in 1900 or later.",
    });
    expect(birthDateValue(parts("18", "11", "2026"), today).ok).toBe(true);
    expect(birthDateValue(parts("01", "01", "1900"), today).ok).toBe(true);
  });
});

describe("birthDateWords", () => {
  it("writes a Birth Date with or without its year", () => {
    expect(birthDateWords("1990-05-04")).toBe("4 May 1990");
    expect(birthDateWords("05-04")).toBe("4 May");
  });
});
