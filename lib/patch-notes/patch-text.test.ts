import type { Value } from "platejs";
import { describe, expect, it } from "vitest";

import { richTextToDiscord } from "@/lib/rich-text/discord-markdown";
import { PATCH_CUT_AT, PATCH_POST_MAX, patchText as convert } from "./patch-text";

// The builders below make loose JSON, as the editor sends.
const patchText = (value: unknown[], options?: { siteUrl?: string }) => convert(value as Value, options);
const t = (text: string, marks: Record<string, boolean> = {}) => ({ text, ...marks });
const p = (...children: unknown[]) => ({ type: "p", children });
const h2 = (text: string) => ({ type: "h2", children: [t(text)] });
const h3 = (text: string) => ({ type: "h3", children: [t(text)] });
const link = (url: string, text: string) => ({ type: "a", url, children: [{ text }] });
const li = (text: string, nested?: unknown) => ({
  type: "li",
  children: [{ type: "lic", children: [t(text)] }, ...(nested ? [nested] : [])],
});
const ul = (...items: unknown[]) => ({ type: "ul", children: items });
const ol = (...items: unknown[]) => ({ type: "ol", children: items });

// `n` characters of nine-letter words a space apart, never ending in one.
const words = (n: number) => "abcdefghi ".repeat(Math.ceil(n / 10)).slice(0, n).replace(/ $/, "z");

describe("patchText", () => {
  it("writes every supported node as Discord markdown", () => {
    const value = [
      p(t("A quieter week.")),
      h2("New"),
      ul(
        li("Patch Notes", ul(li("a stack of Patches"), li("a page each"))),
        li("Pinned Pages"),
      ),
      h3("Small things"),
      p(
        t("Bold", { bold: true }),
        t(", "),
        t("italic", { italic: true }),
        t(", "),
        t("gone", { strikethrough: true }),
        t(" and "),
        t("the ending", { spoiler: true }),
        t(". See "),
        link("/patch-notes/4", "Patch 4"),
        t(" or "),
        link("https://example.com/x", "elsewhere"),
        t("."),
      ),
      ol(li("first"), li("second")),
      { type: "blockquote", children: [p(t("It works on my machine."))] },
    ];
    const result = patchText(value, { siteUrl: "https://club.example" });
    expect(result.markdown).toBe(
      [
        "A quieter week.",
        "## New",
        "- Patch Notes\n  - a stack of Patches\n  - a page each\n- Pinned Pages",
        "### Small things",
        "**Bold**, *italic*, ~~gone~~ and ||the ending||. See [Patch 4](<https://club.example/patch-notes/4>) or [elsewhere](<https://example.com/x>).",
        "1. first\n2. second",
        "> It works on my machine.",
      ].join("\n\n"),
    );
  });

  it("leaves a Patch under the limit whole", () => {
    const value = [h2("Fixed"), ul(li("The login no longer stalls."))];
    const result = patchText(value);
    expect(result).toEqual({
      markdown: "## Fixed\n\n- The login no longer stalls.",
      cutValue: value,
      cutMarkdown: "## Fixed\n\n- The login no longer stalls.",
      cut: false,
      length: 39,
    });
  });

  it("leaves a Patch of exactly the limit whole", () => {
    const result = patchText([p(t(words(PATCH_POST_MAX)))]);
    expect(result.length).toBe(4000);
    expect(result.cut).toBe(false);
  });

  it("cuts after the last whole block that fits, with ...", () => {
    const texts = ["1", "2", "3", "4"].map((n) => `${n}${words(999)}`);
    const blocks = texts.map((text) => p(t(text)));
    const result = patchText(blocks);
    expect(result.cut).toBe(true);
    expect(result.length).toBe(4006);
    expect(result.markdown.length).toBe(4006);
    expect(result.cutMarkdown).toBe(`${texts.slice(0, 3).join("\n\n")}...`);
    expect(result.cutValue).toHaveLength(3);
    expect(result.cutValue[2]).toEqual(p(t(`3${words(999)}`), t("...")));
  });

  it("cuts after the last whole list item that fits", () => {
    const itemText = (i: number) => `item ${String(i).padStart(2, "0")} ${words(88)}`;
    const items = Array.from({ length: 20 }, (_, i) => li(itemText(i)));
    const value = [p(t(words(3000))), ul(...items)];
    const result = patchText(value);
    expect(result.cut).toBe(true);
    // 3000 + 2, then lines of 98 a newline apart: ten items and "..." make
    // 3002 + 989 + 3 = 3994; an eleventh would pass 4000.
    const lastItem = { type: "li", children: [{ type: "lic", children: [t(itemText(9)), t("...")] }] };
    expect(result.cutValue).toEqual([p(t(words(3000))), ul(...items.slice(0, 9), lastItem)]);
    expect(result.cutMarkdown.length).toBe(3994);
    expect(result.cutMarkdown.endsWith(`- item 09 ${words(88)}...`)).toBe(true);
  });

  it("cuts inside a nested list at a whole item", () => {
    const nested = ul(...Array.from({ length: 10 }, (_, i) => li(`sub ${i} ${words(90)}`)));
    const value = [p(t(words(3500))), ul(li("parent", nested), li("next"))];
    const result = patchText(value);
    expect(result.cut).toBe(true);
    expect(result.cutMarkdown).toContain("- parent\n  - sub 0 ");
    expect(result.cutMarkdown).toMatch(/- sub 3 [a-iz ]+\.\.\.$/);
    expect(result.cutMarkdown).not.toContain("sub 4");
    expect(result.cutMarkdown).not.toContain("next");
  });

  it("cuts a single block longer than the limit at a word, with ...", () => {
    const result = patchText([p(t(words(5000)))]);
    expect(result.cut).toBe(true);
    expect(result.length).toBe(5000);
    expect(result.cutMarkdown.length).toBeLessThanOrEqual(PATCH_POST_MAX);
    expect(result.cutMarkdown.length).toBeGreaterThan(PATCH_CUT_AT - 12);
    expect(result.cutMarkdown).toMatch(/ abcdefghi\.\.\.$/);
    expect(result.cutValue).toEqual([p(t(result.cutMarkdown.slice(0, -3)), t("..."))]);
  });

  it("never cuts at an empty paragraph, so ... always follows words", () => {
    const result = patchText([p(t("")), p(t(words(5000))), p(t("")), p(t("after"))]);
    expect(result.cutMarkdown).toMatch(/^abcdefghi .* abcdefghi\.\.\.$/);
  });

  it("cuts a long first block even when it is a list item", () => {
    const result = patchText([ul(li(words(6000)), li("after"))]);
    expect(result.cut).toBe(true);
    expect(result.cutMarkdown.startsWith("- abcdefghi")).toBe(true);
    expect(result.cutMarkdown).toMatch(/abcdefghi\.\.\.$/);
    expect(result.cutMarkdown.length).toBeLessThanOrEqual(PATCH_POST_MAX);
  });

  it("makes the cut markdown the markdown of the cut value, never past 4000", () => {
    const value = [
      h2("New"),
      ...Array.from({ length: 60 }, (_, i) => p(t(`Lead ${i}`, { bold: true }), t(` ${words(60)} `), link("/games/1", "a game"))),
    ];
    const result = patchText(value, { siteUrl: "https://club.example" });
    expect(result.cut).toBe(true);
    expect(result.cutMarkdown).toBe(richTextToDiscord(result.cutValue, { siteUrl: "https://club.example" }));
    expect(result.cutMarkdown.length).toBeLessThanOrEqual(PATCH_POST_MAX);
    expect(result.cutMarkdown.endsWith("...")).toBe(true);
    expect(result.length).toBe(result.markdown.length);
  });

  it("reports the full length of the markdown, escapes and markers included", () => {
    expect(patchText([p(t("2*3", { bold: true }))]).length).toBe("**2\\*3**".length);
    expect(patchText([]).length).toBe(0);
  });
});
