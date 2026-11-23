import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { primitiveLook } from "../eslint/rules/class-names.mjs";
import { THEMES } from "./registry";

// A Theme styles every shadcn primitive by its data-slot and data-variant
// (api ADR-0008), so the primitives carry only their shared base. These tests
// read the primitives and the Theme stylesheets as text.
const root = path.resolve(__dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const primitiveFiles = readdirSync(path.join(root, "components/ui")).filter((f) => f.endsWith(".tsx"));

// Every data-slot a primitive renders: data-slot="x", or slot: "x" in a
// useRender state.
function primitiveSlots(): Set<string> {
  const slots = new Set<string>();
  for (const file of primitiveFiles) {
    const text = read(`components/ui/${file}`);
    for (const m of text.matchAll(/data-slot="([\w-]+)"|\bslot: "([\w-]+)"/g)) slots.add(m[1] ?? m[2]);
  }
  return slots;
}

// Every selector in a stylesheet with its nesting resolved ("&" or a
// descendant of the parent), comments and at-rules skipped.
function selectors(css: string): string[] {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const stack: string[] = [];
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ";") start = i + 1;
    if (text[i] === "{") {
      const prelude = text.slice(start, i).trim();
      const parent = stack.at(-1) ?? "";
      const full = prelude.startsWith("@")
        ? parent
        : prelude
            .split(",")
            .map((part) => (part.includes("&") ? part.replaceAll("&", parent) : `${parent} ${part}`).trim())
            .join(", ");
      stack.push(full);
      if (!prelude.startsWith("@")) out.push(full);
      start = i + 1;
    }
    if (text[i] === "}") {
      stack.pop();
      start = i + 1;
    }
  }
  return out;
}

// "slot", "slot/variant=x", "slot/size=x", "slot/tone=x" for every slot a
// Theme's primitive stylesheet styles, paired with the variant, size and
// tone attributes in the same selector.
function styled(name: string): Set<string> {
  const keys = new Set<string>();
  for (const selector of selectors(read(`themes/${name}/primitives.css`))) {
    const slots = [...selector.matchAll(/\[data-slot="([\w-]+)"\]/g)].map((m) => m[1]);
    const attrs = [...selector.matchAll(/\[data-(variant|size|tone)="([\w-]+)"\]/g)].map((m) => `${m[1]}=${m[2]}`);
    for (const slot of slots) {
      keys.add(slot);
      for (const attr of attrs) keys.add(`${slot}/${attr}`);
    }
  }
  return keys;
}

describe("primitives carry only their base", () => {
  it.each(primitiveFiles)("%s has no colour, radius, shadow or type classes", (file) => {
    const strings = [...read(`components/ui/${file}`).matchAll(/"([^"\n]*)"/g)].map((m) => m[1]);
    const looks = strings.flatMap((s) => s.split(/\s+/)).filter((cls) => cls && primitiveLook(cls));
    expect(looks).toEqual([]);
  });
});

describe("Themes style the primitives", () => {
  it.each(THEMES.map((theme) => theme.name))("the %s Theme loads its primitive styles", (name) => {
    expect(read(`themes/${name}/theme.css`)).toContain('@import "./primitives.css"');
  });

  it.each(THEMES.map((theme) => theme.name))("the %s Theme styles only slots a primitive renders", (name) => {
    const slots = primitiveSlots();
    expect([...styled(name)].map((key) => key.split("/")[0]).filter((slot) => !slots.has(slot))).toEqual([]);
  });

  it("the test Theme restyles every slot, variant, size and tone the Monthly Issue Theme styles", () => {
    const testTheme = styled("test");
    expect([...styled("monthly-issue")].filter((key) => !testTheme.has(key))).toEqual([]);
  });

  it.each(THEMES.map((theme) => theme.name))("the %s Theme styles the semantic variants", (name) => {
    const keys = styled(name);
    const semantic = [
      "button/variant=inverse",
      "button/variant=inverse-outline",
      "badge/tone=gotm",
      "badge/tone=nr",
      "badge/tone=rarity-common",
      "badge/tone=rarity-uncommon",
      "badge/tone=rarity-rare",
      "badge/tone=rarity-ultra",
      "badge/tone=neutral",
      "card/variant=cover",
    ];
    expect(semantic.filter((key) => !keys.has(key))).toEqual([]);
  });
});

// www#95: the imports area's variants (the yellow panel's bar, the candidate
// pick, the problem and comparison tables, the route cards, the file field).
describe("Themes style the imports variants", () => {
  it.each(THEMES.map((theme) => theme.name))("the %s Theme styles them", (name) => {
    const keys = styled(name);
    const imports = [
      "progress/tone=inverse",
      "radio-group-item/variant=choice",
      "table/variant=inset",
      "table/variant=destructive",
      "collapsible/variant=card",
      "input/variant=upload",
    ];
    expect(imports.filter((key) => !keys.has(key))).toEqual([]);
  });
});

// www#97: the voting, GOTM history and suggestions variants (the notice's x,
// a card footer's actions, the archive's search toolbar, the compose and note
// fields, the Suggestion type tags).
describe("Themes style the voting and suggestions variants", () => {
  it.each(THEMES.map((theme) => theme.name))("the %s Theme styles them", (name) => {
    const keys = styled(name);
    const voting = [
      "button/variant=clear",
      "button/variant=card-action",
      "button/variant=card-action-destructive",
      "button/variant=search",
      "select-trigger/variant=search",
      "textarea/variant=note",
      "textarea/variant=compose",
      "input/variant=compose",
      "toggle/variant=tag",
    ];
    expect(voting.filter((key) => !keys.has(key))).toEqual([]);
  });
});

// www#98: the staff desks' variants (the Feature Flag desk's state control,
// reason note and ledger; the rounds form's track picker and row tools; the
// live event topic; the nomination reason; the ruler's "type a date").
describe("Themes style the staff desk variants", () => {
  it.each(THEMES.map((theme) => theme.name))("the %s Theme styles them", (name) => {
    const keys = styled(name);
    const desk = [
      "toggle-group/variant=state",
      "toggle-group-item/variant=state",
      "toggle-group-item/tone=live",
      "toggle-group-item/tone=preview",
      "toggle-group-item/tone=off",
      "toggle-group/variant=track",
      "toggle-group-item/variant=track",
      "toggle-group-item/tone=gotm",
      "toggle-group-item/tone=nr",
      "table/variant=ledger",
      "table-head/variant=grouped",
      "table-cell/variant=grouped",
      "button/variant=note",
      "button/variant=row",
      "button/variant=destructive-row",
      "button/variant=inline-link",
      "button/variant=poster",
      "button/variant=pencil",
      "button/variant=dog-ear",
      "input/variant=headline",
      "textarea/variant=inset",
    ];
    expect(desk.filter((key) => !keys.has(key))).toEqual([]);
  });
});

// The DESIGN.md floor: focus is always visible. Tailwind v4's `outline-none`
// (on every control's base) zeroes the outline style, so a focus outline's
// width alone draws nothing: a Theme rule that sets one must set its style too.
describe("Theme focus outlines are visible", () => {
  it.each(THEMES.map((theme) => theme.name))("the %s Theme sets a style with every focus outline", (name) => {
    const applies = [...read(`themes/${name}/primitives.css`).matchAll(/@apply ([^;]*);/g)].map((m) => m[1]);
    const unstyled = applies.filter(
      (line) =>
        /(^|\s)(has-)?focus-visible:-?outline-(\d|\[)/.test(line) &&
        !/(^|\s)(has-)?focus-visible:(outline-(solid|dashed|dotted|double)\b|\[outline-style:)/.test(line),
    );
    expect(unstyled).toEqual([]);
  });
});
