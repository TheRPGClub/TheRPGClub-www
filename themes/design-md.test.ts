import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { composeDesignMd, defaultThemeName } from "./design-md.mjs";

const root = path.resolve(__dirname, "..");
const designMd = () => readFileSync(path.join(root, "DESIGN.md"), "utf8");

// /impeccable reads only the root DESIGN.md: it must carry the default
// Theme's system in token names, mirrored from that Theme's README.
describe("DESIGN.md", () => {
  it("mirrors the default Theme's README (run `npm run design:sync`)", () => {
    expect(designMd()).toBe(composeDesignMd(root));
  });

  it("names the default Theme from the registry", () => {
    expect(defaultThemeName('export const A: Theme = {\n  name: "a-theme",\n};\nexport const DEFAULT_THEME = A;')).toBe("a-theme");
  });

  it("keeps the Theme floor first", () => {
    const text = designMd();
    expect(text.indexOf("## The Theme floor")).toBeLessThan(text.indexOf("## The default Theme"));
  });

  it("uses token names for colours, never the palette names", () => {
    const colors = /\ncolors:\n((?: {2}[^\n]+\n)+)/.exec(designMd())?.[1] ?? "";
    const keys = colors.split("\n").filter(Boolean).map((line) => line.trim().split(":")[0]);
    expect(keys).toContain("background");
    expect(keys.filter((key) => /^(?:ink|paper|rule)(?:-|$)|-ink$/.test(key))).toEqual([]);
    expect(designMd()).not.toMatch(/\{colors\.(?:ink|paper|rule)(?:-[\w-]+)?\}/);
  });
});
