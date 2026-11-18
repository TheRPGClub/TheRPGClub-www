import { describe, expect, it } from "vitest";

import { sanitizeRichText } from "./sanitize";
import {
  RICH_TEXT_BLOCKS,
  RICH_TEXT_INLINES,
  RICH_TEXT_MARKS,
  type RichTextSchema,
} from "./schema";

const full: RichTextSchema = {
  marks: RICH_TEXT_MARKS,
  blocks: RICH_TEXT_BLOCKS,
  inlines: RICH_TEXT_INLINES,
  maxLength: 100,
};

const p = (...children: unknown[]) => ({ type: "p", children });
const link = (url: string, text: string) => ({
  type: "a",
  url,
  children: [{ text }],
});

describe("sanitizeRichText", () => {
  it("keeps allowed marks and drops unknown props", () => {
    expect(
      sanitizeRichText(
        [{ type: "p", id: "x", children: [{ text: "hi", bold: true, evil: 1, spoiler: true }] }],
        full,
      ),
    ).toEqual([p({ text: "hi", bold: true, spoiler: true })]);
  });

  it("keeps a safe link, normalized, and drops an unsafe one to its text", () => {
    expect(
      sanitizeRichText(
        [p(link("/games/1", "in"), link("example.com", "out"), link("javascript:alert(1)", "bad"))],
        full,
      ),
    ).toEqual([
      p(link("/games/1", "in"), link("https://example.com/", "out"), { text: "bad" }),
    ]);
  });

  it("keeps an unknown block's words as a paragraph", () => {
    expect(
      sanitizeRichText([{ type: "script", children: [{ text: "words" }] }], full),
    ).toEqual([p({ text: "words" })]);
    expect(
      sanitizeRichText([{ type: "constructor", children: [{ text: "x" }] }], full),
    ).toEqual([p({ text: "x" })]);
  });

  it("returns null when nothing has text", () => {
    expect(sanitizeRichText([p({ text: "" })], full)).toBeNull();
    expect(sanitizeRichText("not a value", full)).toBeNull();
  });

  it("follows a narrower schema", () => {
    const plain: RichTextSchema = {
      marks: ["bold"],
      blocks: { p: "inline" },
      inlines: {},
      maxLength: 100,
    };
    // An inline element the schema lacks is dropped whole, as it always was
    // for Reviews: only blocks fall back to their words.
    expect(
      sanitizeRichText(
        [{ type: "h1", children: [{ text: "T", italic: true }] }, p({ text: "a " }, link("https://a.b", "l"))],
        plain,
      ),
    ).toEqual([p({ text: "T" }), p({ text: "a " })]);
  });

  it("takes extra inline types through their own rule", () => {
    const withMention: RichTextSchema = {
      ...full,
      inlines: {
        ...RICH_TEXT_INLINES,
        mention: {
          props: (node) =>
            typeof node.userId === "string" && /^\d+$/.test(node.userId)
              ? { userId: node.userId }
              : null,
        },
      },
    };
    const mention = (userId: string) => ({
      type: "mention",
      userId,
      extra: true,
      children: [{ text: "" }],
    });
    expect(
      sanitizeRichText([p({ text: "hi " }, mention("123"), mention("x"))], withMention),
    ).toEqual([
      p(
        { text: "hi " },
        { type: "mention", userId: "123", children: [{ text: "" }] },
        { text: "" },
      ),
    ]);
  });
});
