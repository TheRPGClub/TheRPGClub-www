import { describe, expect, it } from "vitest";
import { addedDay, cardNumber, cardTilt, dailyLabel, factPanel, occurredLabel, pageParam, pageRange } from "@/lib/codex/wall";
import type { CodexEntry } from "@/lib/codex/types";

describe("cardTilt", () => {
  it("is stable per id and stays a slight tilt", () => {
    for (let id = 1; id < 500; id++) {
      const tilt = cardTilt(id);
      expect(tilt).toBe(cardTilt(id));
      expect(Math.abs(tilt)).toBeGreaterThanOrEqual(0.4);
      expect(Math.abs(tilt)).toBeLessThanOrEqual(2.2);
    }
  });

  it("leans both ways", () => {
    const tilts = Array.from({ length: 40 }, (_, i) => cardTilt(i + 1));
    expect(tilts.some((t) => t < 0)).toBe(true);
    expect(tilts.some((t) => t > 0)).toBe(true);
  });
});

describe("the wall's numbers", () => {
  it("numbers cards oldest first down the pages", () => {
    expect(cardNumber(42, 1, 12, 0)).toBe(42);
    expect(cardNumber(42, 2, 12, 3)).toBe(27);
    expect(cardNumber(42, 4, 12, 5)).toBe(1);
  });

  it("says which cards a page shows", () => {
    expect(pageRange(42, 1, 12, 12)).toBe("1–12 of 42");
    expect(pageRange(42, 4, 12, 6)).toBe("37–42 of 42");
    expect(pageRange(0, 1, 12, 0)).toBe("0 of 0");
  });
});

describe("addedDay", () => {
  it("names the club's day relative to today", () => {
    // 15:00 UTC is 10:00 in New York.
    expect(addedDay("2026-11-18T15:00:00Z", "2026-11-18")).toBe("today");
    expect(addedDay("2026-11-17T15:00:00Z", "2026-11-18")).toBe("yesterday");
    expect(addedDay("2026-11-15T15:00:00Z", "2026-11-18")).toBe("15 Nov");
    expect(addedDay("2022-03-03T15:00:00Z", "2026-11-18")).toBe("3 Mar 2022");
  });

  it("reads the day in New York, not UTC", () => {
    expect(addedDay("2026-11-19T03:00:00Z", "2026-11-18")).toBe("today");
  });
});

describe("occurredLabel", () => {
  it("writes the date at its precision", () => {
    expect(occurredLabel("2026-11-18", "day")).toBe("18 November 2026");
    expect(occurredLabel("2018-03-01", "month")).toBe("March 2018");
    expect(occurredLabel("2016-01-01", "year")).toBe("2016");
  });

  it("is null without a date", () => {
    expect(occurredLabel(null, null)).toBeNull();
    expect(occurredLabel("2016-01-01", null)).toBeNull();
  });
});

describe("pageParam", () => {
  it("reads a page number, else the first page", () => {
    expect(pageParam("3")).toBe(3);
    expect(pageParam(undefined)).toBe(1);
    expect(pageParam("0")).toBe(1);
    expect(pageParam("2.5")).toBe(1);
    expect(pageParam("abc")).toBe(1);
  });
});

describe("dailyLabel", () => {
  it("names the club day the Daily Fun Fact went out, at 15:00", () => {
    expect(dailyLabel("2026-11-18")).toBe("Wed 18 Nov · 15:00");
    expect(dailyLabel("2027-01-03")).toBe("Sun 3 Jan · 15:00");
    expect(dailyLabel("not a day")).toBe("15:00");
  });
});

describe("factPanel", () => {
  const fact = (id: number) => ({ id, part: "fun_fact", body: `Fact ${id}` }) as CodexEntry;

  it("leads with the Daily Fun Fact, then the newest others", () => {
    expect(factPanel({ fact: fact(2), clubDate: "2026-11-18" }, [fact(3), fact(2), fact(1)])).toEqual({
      heading: "Daily Fun Fact",
      label: "Wed 18 Nov · 15:00",
      facts: [fact(2), fact(3), fact(1)],
    });
  });

  it("falls back to the newest Fun Facts when none has been posted", () => {
    expect(factPanel(null, [fact(3), fact(2)])).toEqual({ heading: "Fun Fact", label: "From the wall", facts: [fact(3), fact(2)] });
    expect(factPanel(null, [])).toEqual({ heading: "Fun Fact", label: "None on the wall yet", facts: [] });
  });
});
