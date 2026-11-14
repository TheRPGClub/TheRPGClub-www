// DESIGN.md keeps the Theme floor (api ADR-0008) and, below it, a mirror of
// the default Theme's own design system: its token frontmatter and its
// "Design rules", copied from themes/<default>/README.md. Design tools that
// read only the root DESIGN.md (/impeccable) then see the default look in
// token names, while the rules still live with their Theme.
//
//   node themes/design-md.mjs          check (exit 1 when out of date)
//   node themes/design-md.mjs --write  rewrite DESIGN.md
//
// themes/design-md.test.ts runs the check in `npm test`.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const START = "<!-- default-theme:start -->";
const END = "<!-- default-theme:end -->";
const FRONTMATTER_MARK = "# Mirrored from the default Theme";

// The default Theme's folder name, as themes/registry.ts declares it.
export function defaultThemeName(registry) {
  const id = /export const DEFAULT_THEME = (\w+);/.exec(registry)?.[1];
  const name = id && new RegExp(`export const ${id}: Theme = \\{\\s*name: "([\\w-]+)"`).exec(registry)?.[1];
  if (!name) throw new Error("themes/registry.ts: no DEFAULT_THEME with a name");
  return name;
}

function splitFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) throw new Error("no frontmatter");
  return { frontmatter: match[1], body: text.slice(match[0].length) };
}

// DESIGN.md as it should read, given the repo at `root`.
export function composeDesignMd(root) {
  const read = (file) => readFileSync(path.join(root, file), "utf8");
  const name = defaultThemeName(read("themes/registry.ts"));
  const readme = `themes/${name}/README.md`;
  const theme = splitFrontmatter(read(readme));
  const own = splitFrontmatter(read("DESIGN.md"));

  const ownFrontmatter = own.frontmatter.split(`\n${FRONTMATTER_MARK}`)[0];
  const themeName = /^name: (.+)$/m.exec(theme.frontmatter)?.[1] ?? name;
  const tokens = theme.frontmatter.replace(/^(?:name|description): .*\n/gm, "");
  const floor = own.body.split(START)[0].trimEnd();
  const rulesAt = theme.body.indexOf("## Design rules");
  if (rulesAt < 0) throw new Error(`${readme}: no "## Design rules" section`);
  const rules = theme.body
    .slice(rulesAt)
    .replace("## Design rules", `## The default Theme: ${themeName}`)
    .trimEnd();

  return [
    "---",
    ownFrontmatter,
    `${FRONTMATTER_MARK} (${readme}) by \`npm run design:sync\`; edit it there.`,
    tokens,
    "---",
    floor,
    "",
    START,
    `<!-- Mirrored from ${readme} by \`npm run design:sync\`; edit it there. -->`,
    "",
    rules,
    "",
    `> This section mirrors the default Theme's own rules (\`${readme}\`) so design tools that read only this file see the default look in token names. It is that Theme's design system, not a site-wide rule: every Theme meets the floor above and keeps its own rules in its folder.`,
    END,
    "",
  ].join("\n");
}

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(here, "..");
  const next = composeDesignMd(root);
  const current = readFileSync(path.join(root, "DESIGN.md"), "utf8");
  if (process.argv.includes("--write")) {
    writeFileSync(path.join(root, "DESIGN.md"), next);
    console.log(next === current ? "DESIGN.md is up to date" : "DESIGN.md rewritten");
  } else if (next !== current) {
    console.error("DESIGN.md is out of date: run `npm run design:sync`");
    process.exit(1);
  }
}
