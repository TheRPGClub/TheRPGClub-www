import { describe, expect, it } from "vitest";

import {
  isPast,
  machineDate,
  periodEnd,
  periodTitle,
  precisionNote,
  precisionSpan,
  regionTone,
  releaseDateLabel,
  shortDateLabel,
  utcDay,
  utcToday,
} from "@/lib/releases";

describe("releaseDateLabel", () => {
  it("prints an exact day", () => {
    expect(releaseDateLabel("2025-09-25", "day")).toBe("25 Sep 2025");
  });

  it("never prints a vague date as a day", () => {
    expect(releaseDateLabel("2026-12-01", "month")).toBe("Dec 2026");
    expect(releaseDateLabel("2027-07-01", "quarter")).toBe("Q3 2027");
    expect(releaseDateLabel("2027-01-01", "year")).toBe("2027");
  });

  it("has no label for TBA", () => {
    expect(releaseDateLabel(null, "tba")).toBeNull();
    expect(releaseDateLabel(null, "day")).toBeNull();
  });

  it("reads the calendar day, whatever the time zone", () => {
    expect(releaseDateLabel("2026-01-01", "day")).toBe("1 Jan 2026");
  });
});

describe("the other forms of a date", () => {
  it("gives the list's big date", () => {
    expect(shortDateLabel("2026-11-17", "day")).toBe("17");
    expect(shortDateLabel("2026-12-01", "month")).toBe("Dec");
    expect(shortDateLabel("2027-10-01", "quarter")).toBe("Q4");
    expect(shortDateLabel("2027-01-01", "year")).toBe("2027");
    expect(shortDateLabel(null, "tba")).toBe("TBA");
  });

  it("names a period with its month in full", () => {
    expect(periodTitle("2026-11-01", "month")).toBe("November 2026");
    expect(periodTitle("2027-07-01", "quarter")).toBe("Q3 2027");
    expect(periodTitle("2027-01-01", "year")).toBe("2027");
  });

  it("gives a machine date where HTML has one", () => {
    expect(machineDate("2026-12-17", "day")).toBe("2026-12-17");
    expect(machineDate("2026-12-01", "month")).toBe("2026-12");
    expect(machineDate("2027-07-01", "quarter")).toBeUndefined();
    expect(machineDate("2027-01-01", "year")).toBe("2027");
  });

  it("says what a section's period spans", () => {
    expect(precisionSpan("2027-07-01", "quarter")).toBe("July to September");
    expect(precisionSpan("2027-01-01", "year")).toBe("any month");
    expect(precisionSpan(null, "tba")).toBe("no date announced");
    expect(precisionSpan("2026-12-01", "month")).toBeNull();
  });
});

describe("precisionNote", () => {
  it("says what is still unknown", () => {
    expect(precisionNote("day")).toBeNull();
    expect(precisionNote("month")).toBe("Day TBA");
    expect(precisionNote("quarter")).toBe("Month TBA");
    expect(precisionNote("year")).toBe("Month TBA");
    expect(precisionNote("tba")).toBe("No date yet");
  });
});

describe("periodEnd", () => {
  it("ends each period on its last day", () => {
    expect(periodEnd("2026-11-19", "day")).toBe("2026-11-19");
    expect(periodEnd("2027-02-01", "month")).toBe("2027-02-28");
    expect(periodEnd("2027-10-01", "quarter")).toBe("2027-12-31");
    expect(periodEnd("2027-01-01", "year")).toBe("2027-12-31");
    expect(periodEnd(null, "tba")).toBeNull();
  });
});

describe("isPast", () => {
  const today = "2026-11-18";

  it("is past once its whole period ended", () => {
    expect(isPast("2026-11-17", "day", today)).toBe(true);
    expect(isPast("2026-10-01", "month", today)).toBe(true);
  });

  it("is not past on the day, while its period runs, or when TBA", () => {
    expect(isPast("2026-11-18", "day", today)).toBe(false);
    expect(isPast("2026-11-01", "month", today)).toBe(false);
    expect(isPast("2026-10-01", "quarter", today)).toBe(false);
    expect(isPast(null, "tba", today)).toBe(false);
  });
});

describe("utcDay", () => {
  it("reads any year as a UTC day", () => {
    expect(utcDay("1969-12-31").toISOString()).toBe("1969-12-31T00:00:00.000Z");
    expect(utcDay("0099-03-01").getUTCFullYear()).toBe(99);
    expect(releaseDateLabel("1969-07-16", "day")).toBe("16 Jul 1969");
  });
});

describe("regionTone", () => {
  it("inks the three big regions and strokes the rest", () => {
    expect(regionTone("NA")).toBe("region-na");
    expect(regionTone("eu")).toBe("region-eu");
    expect(regionTone("JP")).toBe("region-jp");
    expect(regionTone("WW")).toBe("region-ww");
    expect(regionTone("AUS")).toBe("region");
  });
});

describe("utcToday", () => {
  it("is the UTC calendar day", () => {
    expect(utcToday(new Date("2026-11-18T23:30:00-05:00"))).toBe("2026-11-19");
  });
});
