import { describe, expect, it } from "vitest";

import { sanitizeStory, storyPlainText } from "./story-schema";

const t = (text: string, marks: Record<string, boolean> = {}) => ({ text, ...marks });
const p = (...children: unknown[]) => ({ type: "p", children });
const mention = (userId: string, value = "Name") => ({ type: "mention", userId, value, children: [{ text: "" }] });
const img = (id: number, caption?: string) => ({
  type: "img",
  id,
  url: `https://cdn.example/codex/${id}.png`,
  ...(caption ? { caption } : {}),
  children: [{ text: "" }],
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
