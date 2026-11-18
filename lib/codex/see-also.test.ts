import { describe, expect, it } from "vitest";
import { entryHref } from "./paths";
import {
  LINKS_MAX,
  addLink,
  bandLabel,
  cleanLinks,
  linkIds,
  linkedNote,
  pickerResults,
  removeLink,
  sameLinks,
  visibleLinks,
} from "./see-also";
import type { CodexEntryLink } from "./types";

const history: CodexEntryLink = { id: 1, part: "history_event", title: "GameDB goes live" };
const lore: CodexEntryLink = { id: 2, part: "lore_entry", title: "The Night the Bot Wiped #general" };
const fact: CodexEntryLink = { id: 3, part: "fun_fact", title: "#general lost 4,132 messages…" };

describe("editing See also", () => {
  it("adds a link once, never the entry itself, never past the most", () => {
    expect(addLink([history], lore, 9)).toEqual([history, lore]);
    expect(addLink([history], history, 9)).toEqual([history]);
    expect(addLink([history], lore, 2)).toEqual([history]);
    const full = Array.from({ length: LINKS_MAX }, (_, i) => ({ ...history, id: 100 + i }));
    expect(addLink(full, lore, null)).toHaveLength(LINKS_MAX);
  });

  it("removes a link and compares lists whatever their order", () => {
    expect(removeLink([history, lore], 1)).toEqual([lore]);
    expect(sameLinks([history, lore], [lore, history])).toBe(true);
    expect(sameLinks([history], [lore])).toBe(false);
    expect(sameLinks([history], [history, lore])).toBe(false);
    expect(linkIds([lore, fact])).toEqual([2, 3]);
  });

  it("leaves the entry being edited out of the results and marks the linked", () => {
    const results = pickerResults([history, lore, fact], 2, [fact]);
    expect(results.map((r) => [r.id, r.linked])).toEqual([
      [1, false],
      [3, true],
    ]);
  });

  it("notes how many are linked", () => {
    expect(linkedNote(0)).toBeNull();
    expect(linkedNote(2)).toBe("2 linked");
  });
});

describe("showing See also", () => {
  it("keeps a Visitor to History Events", () => {
    expect(visibleLinks([history, lore, fact], true)).toEqual([history]);
    expect(visibleLinks([history, lore, fact], false)).toEqual([history, lore, fact]);
  });

  it("keeps only well-formed links from the API", () => {
    expect(cleanLinks([history, { id: "x", part: "lore_entry", title: "" }, { id: 4, part: "wiki", title: "" }, null])).toEqual([history]);
    expect(cleanLinks(undefined)).toEqual([]);
  });

  it("labels a link on the jade band", () => {
    const at = { kind: "milestone" as const, occurred_on: "2020-08-09", date_precision: "day" as const };
    expect(bandLabel(history, at)).toEqual({ chip: "Milestone", meta: "History Event · 9 August 2020" });
    expect(bandLabel(history, null)).toEqual({ chip: "History Event", meta: null });
    expect(bandLabel(lore, { kind: null, occurred_on: "2019-03-01", date_precision: "month" })).toEqual({ chip: "Lore Entry", meta: "March 2019" });
    expect(bandLabel(lore, { kind: null, occurred_on: null, date_precision: null })).toEqual({ chip: "Lore Entry", meta: null });
    expect(bandLabel(fact, null)).toEqual({ chip: "Fun Fact", meta: null });
  });

  it("links each part to where it reads", () => {
    expect(entryHref(history)).toBe("/codex/history?event=1#history-event-1");
    expect(entryHref(lore)).toBe("/codex/lore/2");
    expect(entryHref(fact)).toBe("/codex/fun-facts?fact=3#fun-fact-3");
  });
});
