import { describe, expect, it } from "vitest";

import { storyToDiscord } from "./discord-markdown";
import { sanitizeStory, storyPlainText } from "./story-schema";

const t = (text: string, marks: Record<string, boolean> = {}) => ({ text, ...marks });
const p = (...children: unknown[]) => ({ type: "p", children });
const mention = (userId: string, value = "Name") => ({ type: "mention", userId, value, children: [{ text: "" }] });
const link = (url: string, text: string) => ({ type: "a", url, children: [{ text }] });
const img = (id: number, caption?: string) => ({
  type: "img",
  id,
  url: `https://cdn.example/codex/${id}.png`,
  ...(caption ? { caption } : {}),
  children: [{ text: "" }],
});

// What the save action does: sanitize, then convert.
const convert = (value: unknown[], siteUrl?: string) => storyToDiscord(sanitizeStory(value) ?? [], { siteUrl });

describe("storyToDiscord", () => {
  it("writes headings, a spoiler, a link and a mention as Discord markdown", () => {
    const body = convert([
      p(t("Three days after GameDB went live, "), mention("123456789012345678", "Loot Hoarder"), t(" typed it.")),
      { type: "h2", children: [t("What we lost")] },
      p(t("The ending: "), t("everyone lived", { spoiler: true }), t(". Read "), link("https://example.com/x", "the log"), t(".")),
    ]);
    expect(body).toBe(
      [
        "Three days after GameDB went live, <@123456789012345678> typed it.",
        "## What we lost",
        "The ending: ||everyone lived||. Read [the log](<https://example.com/x>).",
      ].join("\n\n"),
    );
  });

  it("drops image nodes and their captions", () => {
    expect(convert([p(t("Before.")), img(7, "23:12 The command."), p(t("After."))])).toBe("Before.\n\nAfter.");
  });

  it("turns marks into markers that hug the words", () => {
    expect(convert([p(t("a "), t(" bold ", { bold: true }), t("and "), t("both", { bold: true, italic: true }), t(" "), t("gone", { strikethrough: true }))])).toBe(
      "a  **bold** and ***both*** ~~gone~~",
    );
  });

  it("escapes text that would read as markdown or a token", () => {
    expect(convert([p(t("2*3 is_6 | `x` <@1> [y]"))])).toBe("2\\*3 is\\_6 \\| \\`x\\` \\<@1> \\[y\\]");
    expect(convert([p(t("# not a heading")), p(t("> nor a quote")), p(t("1. nor a list"))])).toBe(
      "\\# not a heading\n\n\\> nor a quote\n\n\\1. nor a list",
    );
  });

  it("writes quotes and nested lists line by line", () => {
    const value = [
      { type: "blockquote", children: [p(t("It's fine.")), p(t("- Loot Hoarder"))] },
      {
        type: "ul",
        children: [
          { type: "li", children: [{ type: "lic", children: [t("one")] }, { type: "ol", children: [{ type: "li", children: [{ type: "lic", children: [t("sub")] }] }] }] },
          { type: "li", children: [{ type: "lic", children: [t("two")] }] },
        ],
      },
    ];
    expect(convert(value)).toBe("> It's fine.\n> \n> \\- Loot Hoarder\n\n- one\n  1. sub\n- two");
  });

  it("makes links to this site absolute, or keeps their text without a site address", () => {
    const value = [p(link("/codex/lore/3", "the other story"))];
    expect(convert(value, "https://club.example/")).toBe("[the other story](<https://club.example/codex/lore/3>)");
    expect(convert(value)).toBe("the other story");
  });

  it("writes a link whose text is its address as the bare address", () => {
    expect(convert([p(link("https://example.com/", "https://example.com/"))])).toBe("<https://example.com/>");
  });
});

describe("sanitizeStory", () => {
  it("keeps mentions and uploaded images, and drops pending or unsafe ones", () => {
    const value = sanitizeStory([
      p(t("Hi "), mention("42", "Mog"), { type: "mention", userId: "<script>", value: "x", children: [{ text: "" }] }),
      img(3, "  a   caption "),
      { type: "img", pendingKey: "k1", url: "blob:http://x/1", children: [{ text: "" }] },
      { type: "img", id: 4, url: "javascript:alert(1)", children: [{ text: "" }] },
    ]);
    expect(value).toEqual([
      p(t("Hi "), { type: "mention", userId: "42", value: "Mog", children: [{ text: "" }] }, t("")),
      { type: "img", id: 3, url: "https://cdn.example/codex/3.png", caption: "a caption", children: [{ text: "" }] },
    ]);
  });

  it("strips NUL characters", () => {
    expect(sanitizeStory([p(t("a\u0000b"))])).toEqual([p(t("ab"))]);
  });
});

describe("storyPlainText", () => {
  it("counts mentions as @Name and leaves images out", () => {
    expect(storyPlainText([p(t("Hi "), mention("1", "Mog")), img(1) as never, p(t("Bye"))] as never)).toBe("Hi @Mog\nBye");
  });
});
