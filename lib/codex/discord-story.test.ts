import { describe, expect, it } from "vitest";

import { richTextToDiscord } from "@/lib/rich-text/discord-markdown";
import { discordToStory } from "./discord-story";
import { DESCRIPTION_SCHEMA, sanitizeStory } from "./story-schema";

const t = (text: string, marks: Record<string, boolean> = {}) => ({ text, ...marks });
const p = (...children: unknown[]) => ({ type: "p", children });
const mention = (userId: string) => ({ type: "mention", userId, value: "", children: [{ text: "" }] });

describe("discordToStory", () => {
  it("reads mentions, marks and escapes back into a story", () => {
    expect(discordToStory("Hi <@123>, **big** *news*: ||spoiled|| ~~gone~~ 2\\*3 \\<@1>")).toEqual([
      p(
        t("Hi "),
        mention("123"),
        t(", "),
        t("big", { bold: true }),
        t(" "),
        t("news", { italic: true }),
        t(": "),
        t("spoiled", { spoiler: true }),
        t(" "),
        t("gone", { strikethrough: true }),
        t(" 2*3 <@1>"),
      ),
    ]);
  });

  it("reads nested marks and links", () => {
    expect(discordToStory("***both*** [the log](<https://example.com/x>) <https://example.com/>")).toEqual([
      p(
        t("both", { bold: true, italic: true }),
        t(" "),
        { type: "a", url: "https://example.com/x", children: [t("the log")] },
        t(" "),
        { type: "a", url: "https://example.com/", children: [t("https://example.com/")] },
      ),
    ]);
  });

  it("keeps lone markers as text", () => {
    expect(discordToStory("5 * 3 and a ** b")).toEqual([p(t("5 * 3 and a ** b"))]);
  });

  it("writes the same body back when saved unchanged", () => {
    const bodies = [
      "Three days after GameDB went live, <@123456789012345678> typed it.\n\n## What we lost\n\nThe ending: ||everyone lived||. Read [the log](<https://example.com/x>).",
      "a **bold** and ***both*** ~~gone~~",
      "2\\*3 is\\_6 \\| \\`x\\` \\<@1> \\[y\\]",
      "\\# not a heading\n\n\\> nor a quote\n\n1\\. nor a list\n\n\\-# nor subtext",
      "> It's fine.\n> \n> \\- Loot Hoarder\n\n- one\n  1. sub\n- two",
      "1. first\n2. second\n   more of it",
      "Line one\nline two",
    ];
    for (const body of bodies) expect(richTextToDiscord(discordToStory(body) ?? [])).toBe(body);
  });

  it("reads into a History Event description too, and finds nothing in a blank body", () => {
    expect(discordToStory("<@7> joins.", DESCRIPTION_SCHEMA)).toEqual([p(mention("7"), t(" joins."))]);
    expect(discordToStory("  \n\n ")).toBeNull();
  });
});

describe("sanitizeStory", () => {
  it("keeps a story of mentions alone", () => {
    expect(sanitizeStory([p(mention("7"))], DESCRIPTION_SCHEMA)).toEqual([p(mention("7"))]);
    expect(richTextToDiscord(sanitizeStory([p(mention("7"))]) ?? [])).toBe("<@7>");
  });

  it("still finds nothing in an empty one", () => {
    expect(sanitizeStory([p(t("  "))])).toBeNull();
  });
});
