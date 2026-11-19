import { describe, expect, it } from "vitest";

import {
  PIN_LIMIT,
  isPinKeyList,
  memberPins,
  pinsFull,
  togglePin,
} from "@/lib/pinned-pages";

describe("memberPins", () => {
  it("takes the session's Pinned Pages", () => {
    expect(memberPins(["news", "releases"])).toEqual(["news", "releases"]);
  });

  it("keeps an empty list empty", () => {
    expect(memberPins([])).toEqual([]);
  });

  it("falls back to the club default when the API sends none", () => {
    expect(memberPins(undefined)).toEqual(["voting", "games", "members", "news"]);
  });
});

describe("togglePin", () => {
  it("adds a new pin at the bottom", () => {
    expect(togglePin(["voting", "games"], "news")).toEqual(["voting", "games", "news"]);
  });

  it("removes a pinned page and keeps the others' order", () => {
    expect(togglePin(["voting", "games", "news"], "games")).toEqual(["voting", "news"]);
  });

  it("refuses a seventh pin, dropping nothing", () => {
    const six = ["voting", "games", "members", "news", "codex", "releases"];
    expect(PIN_LIMIT).toBe(6);
    expect(pinsFull(six)).toBe(true);
    expect(togglePin(six, "journals")).toBeNull();
  });

  it("still unpins from a full list", () => {
    const six = ["voting", "games", "members", "news", "codex", "releases"];
    expect(togglePin(six, "codex")).toEqual(["voting", "games", "members", "news", "releases"]);
  });
});

describe("isPinKeyList", () => {
  it("accepts known page keys, staff ones too", () => {
    expect(isPinKeyList(["voting", "staff_desk", "suggestion_review"])).toBe(true);
    expect(isPinKeyList([])).toBe(true);
  });

  it("refuses anything else", () => {
    expect(isPinKeyList(["dashboard"])).toBe(false);
    expect(isPinKeyList("voting")).toBe(false);
    expect(isPinKeyList([1])).toBe(false);
  });
});
