import { describe, expect, it } from "vitest";

import { dropEmptyItems, isPatchTemplate, patchCount, patchFields, patchTemplate, patchTitleField } from "./patch-draft";
import type { PendingChange } from "./pending-changes";

const t = (text: string) => ({ text });
const p = (text: string) => ({ type: "p", children: [t(text)] });
const link = (url: string, text: string) => ({ type: "p", children: [{ type: "a", url, children: [t(text)] }] });

function change(over: Partial<PendingChange> = {}): PendingChange {
  return {
    id: 1,
    repo: "www",
    pr_number: 10,
    type: "feat",
    title: "feat(www): a change",
    version: "1.0.0",
    patch_note: null,
    section: "new",
    status: "covered",
    patch_number: 4,
    created_at: "2026-11-01T00:00:00Z",
    ...over,
  };
}

type Node = { type?: string; text?: string; children?: Node[] };
const textOf = (n: Node): string => n.text ?? (n.children ?? []).map(textOf).join("");

// The template's bullets under each heading.
function bullets(value: unknown[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const nodes = value as Node[];
  nodes.forEach((n, i) => {
    if (n.type === "h2") out[textOf(n)] = (nodes[i + 1].children ?? []).map(textOf);
  });
  return out;
}

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

  it("drafts one bullet per covered Pending Change under its section, oldest first", () => {
    const value = patchTemplate([
      change({ id: 3, section: "fixed", title: "fix(www): stop the sidebar jumping", created_at: "2026-11-03" }),
      change({ id: 1, section: "new", title: "feat(api): news feed", patch_note: "The news page knows what you've read.", created_at: "2026-11-01" }),
      change({ id: 2, section: "new", title: "feat(bot): /patchnotes command", created_at: "2026-11-02" }),
    ]);
    expect(bullets(value)).toEqual({
      New: ["The news page knows what you've read.", "feat(bot): /patchnotes command"],
      Improved: [""],
      Fixed: ["fix(www): stop the sidebar jumping"],
    });
    expect(value[0]).toEqual(p(""));
  });

  it("uses the title when the Patch note line is blank", () => {
    expect(bullets(patchTemplate([change({ patch_note: "   ", title: "perf(api): faster lists", section: "improved" })])).Improved).toEqual([
      "perf(api): faster lists",
    ]);
  });
});

describe("isPatchTemplate", () => {
  const covered = [change({ id: 1 }), change({ id: 2, section: "fixed" })];

  it("knows the untouched template drafted from what is covered, saved or not", () => {
    expect(isPatchTemplate(patchTemplate(covered), covered)).toBe(true);
    expect(isPatchTemplate(patchFields("", patchTemplate(), null, { keepEmpty: true }).rich_body, [])).toBe(true);
    expect(isPatchTemplate(patchFields("", patchTemplate(covered), null).rich_body, covered)).toBe(true);
  });

  it("is false once staff have written in it, or for another covered set", () => {
    const written = [p("Hello all"), ...patchTemplate(covered).slice(1)];
    expect(isPatchTemplate(written, covered)).toBe(false);
    expect(isPatchTemplate(patchTemplate(covered), covered.slice(0, 1))).toBe(false);
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

describe("dropEmptyItems", () => {
  const li = (text: string, nested?: unknown) => ({
    type: "li",
    children: [{ type: "lic", children: [t(text)] }, ...(nested ? [nested] : [])],
  });
  const ul = (...items: unknown[]) => ({ type: "ul", children: items });
  const h2 = (text: string) => ({ type: "h2", children: [t(text)] });

  it("drops empty bullets, and a heading left with none", () => {
    const value = [p("Intro"), h2("New"), ul(li("A thing"), li(" ")), h2("Improved"), ul(li("")), h2("Fixed"), ul(li(""))];
    expect(dropEmptyItems(value as never)).toEqual([p("Intro"), h2("New"), ul(li("A thing"))]);
  });

  it("keeps a heading over other writing, and an item whose nested list has text", () => {
    const value = [h2("New"), ul(li("")), p("Written here"), ul(li("", ul(li("detail"), li(""))))];
    expect(dropEmptyItems(value as never)).toEqual([h2("New"), p("Written here"), ul(li("", ul(li("detail"))))]);
  });

  it("leaves a heading that never had a list alone", () => {
    expect(dropEmptyItems([h2("New"), h2("Fixed"), ul(li("x"))] as never)).toEqual([h2("New"), h2("Fixed"), ul(li("x"))]);
  });
});

describe("patchFields drops empty bullets", () => {
  it("never ships the template's empty bullets as \"- \"", () => {
    const fields = patchFields("", patchTemplate(), null);
    expect(fields.body).toBe("");
    expect(fields.rich_body).toEqual([]);
  });

  it("keeps them when asked (a new draft keeps its template)", () => {
    const fields = patchFields("", patchTemplate(), null, { keepEmpty: true });
    expect(fields.body).toContain("## New");
  });
});

describe("patchCount", () => {
  it("groups thousands and turns over past 4000", () => {
    expect(patchCount(1284)).toEqual({ count: "1,284", max: "4,000", over: false });
    expect(patchCount(4000).over).toBe(false);
    expect(patchCount(4001)).toEqual({ count: "4,001", max: "4,000", over: true });
  });
});
