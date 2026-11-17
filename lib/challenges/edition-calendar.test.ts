import { describe, expect, it } from "vitest";
import {
  calendarError,
  calendarPreview,
  calendarStrip,
  editionDatesIn,
  editionRules,
  formatWeekday,
} from "@/lib/challenges/edition-calendar";

const days = (tiles: ReturnType<typeof calendarStrip>) =>
  tiles.map((t) => (t.kind === "gap" ? `…${t.days}` : String(t.day)));

describe("calendarStrip", () => {
  const edition = { signup_cutoff_on: "2026-12-01", pick_deadline_on: "2026-12-15", reveal_on: "2026-12-25" };

  it("runs from the draw to the reveal with the three key days captioned", () => {
    const tiles = calendarStrip(edition, "2026-11-17");
    expect(tiles).toHaveLength(25);
    expect(days(tiles)[0]).toBe("1");
    expect(days(tiles)[24]).toBe("25");
    const keys = tiles.flatMap((t) => (t.kind === "day" && t.key ? [`${t.day} ${t.key}`] : []));
    expect(keys).toEqual(["1 Draw", "15 Picks due", "25 Reveal"]);
  });

  it("marks nothing gone before the draw", () => {
    const tiles = calendarStrip(edition, "2026-11-17");
    expect(tiles.some((t) => t.kind === "day" && (t.past || t.today))).toBe(false);
  });

  it("marks the days gone and rings today while the Edition is picking", () => {
    const tiles = calendarStrip(edition, "2026-12-08");
    const past = tiles.filter((t) => t.kind === "day" && t.past).map((t) => (t.kind === "day" ? t.day : 0));
    expect(past).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(tiles.find((t) => t.kind === "day" && t.today)).toMatchObject({ day: 8 });
  });

  it("marks nothing once the reveal has passed", () => {
    const tiles = calendarStrip(edition, "2027-03-03");
    expect(tiles.some((t) => t.kind === "day" && (t.past || t.today))).toBe(false);
  });

  it("crosses the new year", () => {
    const tiles = calendarStrip(
      { signup_cutoff_on: "2026-12-20", pick_deadline_on: "2027-01-05", reveal_on: "2027-01-15" },
      "2026-11-01",
    );
    expect(days(tiles).slice(10, 14)).toEqual(["30", "31", "1", "2"]);
    expect(tiles).toHaveLength(27);
  });

  it("folds long stretches between key days into gaps", () => {
    const tiles = calendarStrip(
      { signup_cutoff_on: "2026-06-01", pick_deadline_on: "2026-09-01", reveal_on: "2026-12-25" },
      "2026-05-01",
    );
    expect(tiles.length).toBeLessThanOrEqual(31);
    expect(tiles.filter((t) => t.kind === "gap").length).toBeGreaterThan(0);
    const keys = tiles.flatMap((t) => (t.kind === "day" && t.key ? [t.key] : []));
    expect(keys).toEqual(["Draw", "Picks due", "Reveal"]);
  });
});

describe("editionDatesIn", () => {
  it("puts each day before the reveal, as the API does", () => {
    expect(editionDatesIn({ cutoff: "12-01", deadline: "12-15", reveal: "12-25" }, 2026)).toEqual({
      signup_cutoff_on: "2026-12-01",
      pick_deadline_on: "2026-12-15",
      reveal_on: "2026-12-25",
    });
    expect(editionDatesIn({ cutoff: "12-20", deadline: "01-05", reveal: "01-15" }, 2027)).toEqual({
      signup_cutoff_on: "2026-12-20",
      pick_deadline_on: "2027-01-05",
      reveal_on: "2027-01-15",
    });
  });
});

describe("calendarPreview", () => {
  it("shows the whole of December when the calendar sits in it", () => {
    const preview = calendarPreview({ cutoff: "12-01", deadline: "12-15", reveal: "12-25" }, 2026);
    expect(preview.title).toBe("December preview");
    expect(days(preview.tiles)).toHaveLength(31);
    expect(preview.tiles.find((t) => t.kind === "day" && t.key === "Reveal")).toMatchObject({ day: 25 });
  });

  it("shows the draw to the reveal otherwise", () => {
    const preview = calendarPreview({ cutoff: "12-20", deadline: "01-05", reveal: "01-15" }, 2026);
    expect(preview.title).toBe("Calendar preview");
    expect(days(preview.tiles)[0]).toBe("20");
    expect(days(preview.tiles).at(-1)).toBe("15");
  });
});

describe("calendarError", () => {
  it("accepts the Secret Santa calendar and one crossing the new year", () => {
    expect(calendarError({ cutoff: "12-01", deadline: "12-15", reveal: "12-25" })).toBeNull();
    expect(calendarError({ cutoff: "12-20", deadline: "01-05", reveal: "01-15" })).toBeNull();
  });

  it("refuses the same day twice", () => {
    expect(calendarError({ cutoff: "12-01", deadline: "12-01", reveal: "12-25" })).toMatch(/three different days/);
  });

  it("refuses days out of order", () => {
    expect(calendarError({ cutoff: "12-15", deadline: "12-01", reveal: "12-25" })).toMatch(/after/);
  });

  it("refuses 29 February", () => {
    expect(calendarError({ cutoff: "02-29", deadline: "03-15", reveal: "03-25" })).toMatch(/29 February/);
  });

  it("refuses something that isn't a day", () => {
    expect(calendarError({ cutoff: "13-01", deadline: "12-15", reveal: "12-25" })).toMatch(/Pick/);
  });
});

describe("formatWeekday", () => {
  it("names the weekday", () => {
    expect(formatWeekday("2026-12-01")).toBe("Tue 1 Dec");
    expect(formatWeekday("2027-12-25", "2026-11-17")).toBe("Sat 25 Dec 2027");
  });
});

describe("editionRules", () => {
  it("tells the Edition in one paragraph", () => {
    expect(editionRules({ cutoff: "12-01", deadline: "12-15", reveal: "12-25" })).toBe(
      "Sign up before 1 December with at least 5 games in your backlog. On 1 December everyone is drawn into one circle: you pick a game for one member, and another member picks one for you. Picks are due 15 December, and a missed pick becomes a random game from the backlog. Every game is revealed on 25 December, and you have until the next 25 December to Clear it. Santas stay secret until the Edition ends.",
    );
  });
});
