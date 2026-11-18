import { describe, expect, it } from "vitest";
import {
  bookPage,
  chapterDate,
  chapterPhotos,
  eventPage,
  focusQuery,
  historyEventParam,
  historyHref,
  historyQuery,
  kindCounts,
  kindInk,
  orderedEvents,
  readDescription,
  timelineHref,
} from "./history";
import type { CodexEntry } from "./types";

function event(id: number, occurred_on: string, kind = "milestone", extra: Partial<CodexEntry> = {}): CodexEntry {
  return {
    id,
    part: "history_event",
    title: `Event ${id}`,
    rich_body: null,
    body: null,
    occurred_on,
    date_precision: "day",
    kind,
    author: { user_id: "1", name: "Tester", avatar_url: "" },
    mentions: {},
    images: [],
    links: [],
    viewer: { can_edit: false, can_delete: false },
    created_at: "2026-11-18T00:00:00Z",
    updated_at: "2026-11-18T00:00:00Z",
    ...extra,
  };
}

const book = [
  event(1, "2016-01-01", "founding"),
  event(2, "2016-06-01", "milestone"),
  event(3, "2018-03-14", "staff"),
  event(4, "2018-03-01", "platform"),
  event(5, "2020-08-08", "staff"),
];

describe("historyQuery", () => {
  it("reads the kind, order and page, each falling back to its default", () => {
    expect(historyQuery({ kind: "staff", order: "newest", page: "2" })).toEqual({ kind: "staff", order: "newest", page: 2 });
    expect(historyQuery({ kind: "tag", order: "sideways", page: "-1" })).toEqual({ kind: null, order: "oldest", page: 1 });
    expect(historyQuery({})).toEqual({ kind: null, order: "oldest", page: 1 });
  });

  it("writes only what differs from the defaults", () => {
    expect(historyHref("/codex/history", { kind: null, order: "oldest", page: 1 })).toBe("/codex/history");
    expect(historyHref("/codex/history", { kind: "rules", order: "newest", page: 3 })).toBe(
      "/codex/history?kind=rules&order=newest&page=3",
    );
  });
});

describe("chapterDate", () => {
  it("drops the year the chapter already names", () => {
    expect(chapterDate("2018-03-14", "day")).toBe("14 March");
    expect(chapterDate("2018-06-01", "month")).toBe("June");
    expect(chapterDate("2016-01-01", "year")).toBeNull();
    expect(chapterDate(null, "day")).toBeNull();
  });
});

describe("kinds", () => {
  it("counts each Kind", () => {
    expect(kindCounts(book)).toEqual({ founding: 1, staff: 2, platform: 1, rules: 0, milestone: 1 });
  });

  it("reads a Kind's ink, an unknown one as Milestone's", () => {
    expect(kindInk("staff")).toBe("var(--color-kind-staff)");
    expect(kindInk("bogus")).toBe("var(--color-kind-milestone)");
  });
});

describe("bookPage", () => {
  it("makes a chapter per year and a gap for each empty year between", () => {
    const items = bookPage(orderedEvents(book, null, "oldest"), 1, 40);
    expect(items.map((item) => (item.type === "gap" ? `gap ${item.year}` : `${item.year}: ${item.events.map((e) => e.id)}`))).toEqual([
      "2016: 1,2",
      "gap 2017",
      "2018: 3,4",
      "gap 2019",
      "2020: 5",
    ]);
  });

  it("runs newest first when asked, gaps included", () => {
    const items = bookPage(orderedEvents(book, null, "newest"), 1, 40);
    expect(items.map((item) => `${item.type} ${item.year}`)).toEqual([
      "chapter 2020",
      "gap 2019",
      "chapter 2018",
      "gap 2017",
      "chapter 2016",
    ]);
  });

  it("filters to one Kind, its gaps the years without that Kind", () => {
    const items = bookPage(orderedEvents(book, "staff", "oldest"), 1, 40);
    expect(items.map((item) => `${item.type} ${item.year}`)).toEqual(["chapter 2018", "gap 2019", "chapter 2020"]);
  });

  it("repeats a year split across pages, with the year's whole count", () => {
    const events = orderedEvents(book, null, "oldest");
    const second = bookPage(events, 2, 3);
    expect(second[0]).toMatchObject({ type: "chapter", year: 2018, count: 2 });
    expect(second[0].type === "chapter" && second[0].events.map((e) => e.id)).toEqual([4]);
    expect(bookPage(events, 9, 3)).toEqual([]);
  });
});

describe("chapterPhotos", () => {
  it("pins every event's images in event order, tilts alternating", () => {
    const photos = chapterPhotos([
      event(1, "2018-01-01", "staff", {
        images: [
          { id: 11, url: "https://img/b", position: 2 },
          { id: 10, url: "https://img/a", position: 1 },
        ],
      }),
      event(2, "2018-02-01", "staff", { images: [{ id: 12, url: "https://img/c", position: 1 }] }),
    ]);
    expect(photos.map((photo) => [photo.id, photo.tilt])).toEqual([
      [10, -2.2],
      [11, 1.6],
      [12, -2.2],
    ]);
  });
});

describe("readDescription", () => {
  it("opens a description with its mentions under current names", () => {
    const value = readDescription(
      event(1, "2018-01-01", "staff", {
        rich_body: [{ type: "p", children: [{ type: "mention", userId: "7", value: "Old Name", children: [{ text: "" }] }, { text: " joins." }] }],
        body: "<@7> joins.",
        mentions: { "7": { user_id: "7", name: "New Name", avatar_url: "" } },
      }),
    );
    expect(JSON.stringify(value)).toContain('"value":"New Name"');
  });

  it("reads one without rich text from its Discord text, else an empty page", () => {
    const value = readDescription(event(1, "2018-01-01", "staff", { body: "First.\n\nSecond." }));
    expect(value).toHaveLength(2);
    expect(readDescription(null)).toHaveLength(1);
  });
});

describe("See also on the timeline (www#127)", () => {
  const q = historyQuery({});

  it("reads ?event= as a History Event id", () => {
    expect(historyEventParam("7")).toBe(7);
    expect(historyEventParam("0")).toBeNull();
    expect(historyEventParam("x")).toBeNull();
    expect(historyEventParam(undefined)).toBeNull();
  });

  it("finds the page holding a History Event", () => {
    expect(eventPage(book, 1, 2)).toBe(1);
    expect(eventPage(book, 3, 2)).toBe(2);
    expect(eventPage(book, 99, 2)).toBeNull();
  });

  it("moves the page to the one holding ?event=, in the order shown", () => {
    expect(focusQuery(q, book, 5, 2)).toEqual({ ...q, page: 3 });
    expect(focusQuery({ ...q, order: "newest" }, book, 5, 2)).toEqual({ ...q, order: "newest", page: 1 });
    expect(focusQuery({ ...q, page: 2 }, book, null, 2)).toEqual({ ...q, page: 2 });
    expect(focusQuery({ ...q, page: 2 }, book, 99, 2)).toEqual({ ...q, page: 2 });
  });

  it("links to the anchor on this page, else the page holding it", () => {
    expect(timelineHref(book, q, 2, 2)).toBe("#history-event-2");
    expect(timelineHref(book, q, 5, 2)).toBe("/codex/history?page=3#history-event-5");
    expect(timelineHref(book, { ...q, order: "newest" }, 1, 2)).toBe("/codex/history?order=newest&page=3#history-event-1");
  });

  it("drops a Kind filter that hides the linked History Event", () => {
    expect(timelineHref(book, { ...q, kind: "staff" }, 5, 2)).toBe("#history-event-5");
    expect(timelineHref(book, { ...q, kind: "staff" }, 1, 2)).toBe("/codex/history#history-event-1");
    expect(timelineHref(book, { ...q, kind: "staff" }, 4, 2)).toBe("/codex/history?page=2#history-event-4");
  });

  it("sends one the timeline doesn't hold through ?event=", () => {
    expect(timelineHref(book, q, 99, 2)).toBe("/codex/history?event=99#history-event-99");
  });
});
