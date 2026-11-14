import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { THEMES } from "./registry";

// A Theme is a stylesheet that sets tokens (api ADR-0008). These tests read
// the stylesheets as text: the token map in app/globals.css names what a
// Theme must set, and every Theme sets all of it.
const root = path.resolve(__dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

function declared(css: string): Set<string> {
  return new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
}

function themeBlock(css: string, name: string): string {
  const start = css.indexOf(`[data-theme="${name}"]`);
  expect(start, `no [data-theme="${name}"] block`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error("unclosed theme block");
}

// The tokens the token map and base styles read: var(--x) in globals.css
// (not var(--x, fallback), which is a local knob), minus the ones globals.css
// defines itself (Tailwind's own --color-* keys).
function tokensReadByGlobals(): string[] {
  const css = read("app/globals.css");
  const reads = new Set([...css.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));
  const own = declared(css);
  return [...reads].filter((name) => !own.has(name)).sort();
}

const tokensOf = (name: string) => declared(themeBlock(read(`themes/${name}/theme.css`), name));

describe("Theme tokens", () => {
  it("the token map covers the role, club-colour, shape and type tokens", () => {
    const reads = tokensReadByGlobals();
    for (const token of ["--background", "--foreground", "--border", "--gotm", "--nr", "--highlight", "--rarity-ultra", "--radius", "--typeface-body"]) {
      expect(reads).toContain(token);
    }
  });

  it.each(THEMES.map((theme) => theme.name))("the %s Theme's stylesheet is loaded", (name) => {
    expect(read("app/globals.css")).toContain(`@import "../themes/${name}/theme.css";`);
  });

  it.each(THEMES.map((theme) => theme.name))("the %s Theme sets every token the site reads", (name) => {
    const tokens = tokensOf(name);
    expect(tokensReadByGlobals().filter((token) => !tokens.has(token))).toEqual([]);
  });

  it("the test Theme swaps every token the Monthly Issue Theme sets", () => {
    const testTheme = tokensOf("test");
    expect([...tokensOf("monthly-issue")].filter((token) => !testTheme.has(token))).toEqual([]);
  });

  it.each(THEMES.map((theme) => theme.name))("the %s Theme leaves the fixed colours alone", (name) => {
    expect([...tokensOf(name)].filter((token) => /provider|tier-|brand-/.test(token))).toEqual([]);
  });
});
