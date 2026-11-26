import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SHARE_CARD_PALETTE } from "./palette";

const css = readFileSync(
  path.join(__dirname, "../../themes/monthly-issue/theme.css"),
  "utf8",
);

// camelCase key -> CSS custom property (dimForeground -> --dim-foreground).
const token = (key: string) => `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

describe("SHARE_CARD_PALETTE", () => {
  it.each(Object.entries(SHARE_CARD_PALETTE))("matches the default Theme's %s", (key, value) => {
    const match = new RegExp(`${token(key)}:\\s*(#[0-9a-f]{6})\\b`, "i").exec(css);
    expect(match?.[1].toLowerCase()).toBe(value);
  });
});
