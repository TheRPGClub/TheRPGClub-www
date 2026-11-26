import { describe, expect, it } from "vitest";

import { patchCount, patchFields, patchTemplate, patchTitleField } from "./patch-draft";

const t = (text: string) => ({ text });
const p = (text: string) => ({ type: "p", children: [t(text)] });
const link = (url: string, text: string) => ({ type: "p", children: [{ type: "a", url, children: [t(text)] }] });

describe("patchTemplate", () => {
  it("starts with an intro, then New, Improved and Fixed over a bullet each", () => {
    const value = patchTemplate();
    expect(value.map((n) => n.type)).toEqual(["p", "h2", "ul", "h2", "ul", "h2", "ul"]);
    expect(value.filter((n) => n.type === "h2").map((n) => (n.children[0] as { text: string }).text)).toEqual([
      "New",
      "Improved",
      "Fixed",
    ]);
  });

  it("comes back as a fresh value each time", () => {
    expect(patchTemplate()).not.toBe(patchTemplate());
  });
});

describe("patchTitleField", () => {
  it("squeezes spaces and gives null for a blank title", () => {
    expect(patchTitleField("  The   Franchise update ")).toBe("The Franchise update");
    expect(patchTitleField("   ")).toBeNull();
  });
});

describe("patchFields", () => {
  it("stores the sanitized value with its whole and cut markdown", () => {
    const fields = patchFields(" Big one ", [p("Hello"), { type: "script", children: [t("there")] }], null);
    expect(fields).toEqual({
      title: "Big one",
      rich_body: [p("Hello"), p("there")],
      body: "Hello\n\nthere",
      cut_body: "Hello\n\nthere",
    });
  });

  it("makes the site's own links whole for Discord", () => {
    const fields = patchFields("", [link("/patch-notes/4", "Patch 4")], "https://club.example");
    expect(fields.body).toBe("[Patch 4](<https://club.example/patch-notes/4>)");
  });

  it("cuts a long Patch for the post, keeping the whole body", () => {
    const long = Array.from({ length: 50 }, (_, i) => p(`${i} ${"word ".repeat(19)}`.trim()));
    const fields = patchFields("", long, null);
    expect(fields.body.length).toBeGreaterThan(4000);
    expect(fields.cut_body.length).toBeLessThanOrEqual(4000);
    expect(fields.cut_body.endsWith("...")).toBe(true);
  });

  it("stores an empty Patch as no blocks and no text", () => {
    expect(patchFields("", [p("")], null)).toEqual({ title: null, rich_body: [], body: "", cut_body: "" });
  });
});

describe("patchCount", () => {
  it("groups thousands and turns over past 4000", () => {
    expect(patchCount(1284)).toEqual({ count: "1,284", max: "4,000", over: false });
    expect(patchCount(4000).over).toBe(false);
    expect(patchCount(4001)).toEqual({ count: "4,001", max: "4,000", over: true });
  });
});
