import { describe, expect, it } from "vitest";
import {
  encodeFunFact,
  funFactDraft,
  funFactPlain,
  funFactSegments,
  insertMention,
  mentionQuery,
} from "@/lib/codex/fun-fact-text";

const member = (user_id: string, name: string) => ({ user_id, name, avatar_url: `/api/v1/users/${user_id}/avatar` });
const mentions = { "11": member("11", "Backlog Slayer"), "22": member("22", "Mog") , "33": member("33", "Mog Whisperer") };

describe("funFactSegments", () => {
  it("splits the text at known members' tokens, legacy ones too", () => {
    expect(funFactSegments("<@11> met <@!22>.", mentions)).toEqual([
      { kind: "mention", member: mentions["11"] },
      { kind: "text", text: " met " },
      { kind: "mention", member: mentions["22"] },
      { kind: "text", text: "." },
    ]);
  });

  it("keeps an unknown member's token as text", () => {
    expect(funFactSegments("Hi <@99> there", mentions)).toEqual([{ kind: "text", text: "Hi <@99> there" }]);
  });

  it("doesn't take a token for a key on Object's prototype", () => {
    expect(funFactPlain("<@0>", {})).toBe("<@0>");
  });

  it("reads plain text unchanged", () => {
    expect(funFactSegments("No mentions.", mentions)).toEqual([{ kind: "text", text: "No mentions." }]);
    expect(funFactSegments("", mentions)).toEqual([]);
  });
});

describe("the form round trip", () => {
  it("shows tokens as names and saves names back as tokens", () => {
    const body = "<@11> beat <@33> and <@22>, but not <@99>.";
    const draft = funFactDraft(body, mentions);
    expect(draft.text).toBe("@Backlog Slayer beat @Mog Whisperer and @Mog, but not <@99>.");
    expect(encodeFunFact(draft.text, draft.picked)).toBe(body);
  });

  it("only turns a whole picked name into a token", () => {
    const picked = [{ id: "22", name: "Mog" }];
    expect(encodeFunFact("@Moggy and @Mog's hat, mail@Mog", picked)).toBe("@Moggy and <@22>'s hat, mail<@22>");
    expect(encodeFunFact("@Someone else", picked)).toBe("@Someone else");
  });
});

describe("mentionQuery", () => {
  it("finds the @ being typed before the caret", () => {
    expect(mentionQuery("by @sa", 6)).toEqual({ start: 3, query: "sa" });
    expect(mentionQuery("@", 1)).toEqual({ start: 0, query: "" });
  });

  it("ignores an @ inside a word or already finished", () => {
    expect(mentionQuery("mail@sa", 7)).toBeNull();
    expect(mentionQuery("by @sa and", 10)).toBeNull();
  });
});

describe("insertMention", () => {
  it("puts the name in place of the query, with a space after", () => {
    expect(insertMention("by @sa", 3, 6, "Save Scummer")).toEqual({ text: "by @Save Scummer ", caret: 17 });
  });

  it("reuses a space already there", () => {
    expect(insertMention("by @sa rest", 3, 6, "Save Scummer")).toEqual({ text: "by @Save Scummer rest", caret: 17 });
  });
});
