import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { THEMES } from "./registry";

// Adding a Theme (DESIGN.md "Adding a Theme"): its folder, its entry in
// themes/registry.ts, its stylesheet loaded where the registry says it
// ships, and its fonts' classes. These tests read the files as text and name
// whichever step is missing.
const root = path.resolve(__dirname, "..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const folders = readdirSync(path.join(root, "themes"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(root, "themes", entry.name, "theme.css")))
  .map((entry) => entry.name)
  .sort();
const stylesheet = (name: string) => `../themes/${name}/theme.css`;

// The body of the root layout's development-only branch.
function developmentBranch(): string {
  const layout = read("app/layout.tsx");
  const start = layout.indexOf('if (process.env.NODE_ENV === "development")');
  return start < 0 ? "" : layout.slice(start, layout.indexOf("}", start));
}

describe("every Theme is wired in", () => {
  it("registers every Theme folder, and only those", () => {
    expect(THEMES.map((theme) => theme.name).sort()).toEqual(folders);
  });

  it.each(THEMES.filter((theme) => !theme.devOnly).map((theme) => theme.name))(
    "ships the %s Theme's stylesheet from app/globals.css",
    (name) => {
      expect(read("app/globals.css")).toContain(`@import "${stylesheet(name)}"`);
    },
  );

  it.each(THEMES.filter((theme) => theme.devOnly).map((theme) => theme.name))(
    "loads the development-only %s Theme's stylesheet in development alone",
    (name) => {
      expect(read("app/globals.css")).not.toContain(stylesheet(name));
      expect(developmentBranch()).toContain(`import("../themes/${name}/styles")`);
      expect(read(`themes/${name}/styles.ts`)).toContain(`import "./theme.css";`);
    },
  );

  it.each(folders.filter((name) => existsSync(path.join(root, "themes", name, "fonts.ts"))))(
    "gives the %s Theme's fonts their classes in themes/index.ts",
    (name) => {
      expect(read("themes/index.ts")).toMatch(new RegExp(`"${name}":`));
    },
  );
});
