import path from "node:path";

import { ESLint, type Linter } from "eslint";
import { describe, expect, it } from "vitest";

// These tests lint deliberately bad samples through the real eslint.config.mjs,
// so they prove each structure rule fires where the spec says, and only there.
const root = path.resolve(__dirname, "..");
const eslint = new ESLint({ cwd: root });

async function warningsFor(
  ruleId: string,
  code: string,
  file: string,
): Promise<Linter.LintMessage[]> {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, file),
  });
  return result.messages.filter((m) => m.ruleId === ruleId);
}

function codeLines(count: number): string {
  return Array.from({ length: count }, (_, i) => `export const v${i} = ${i};`).join("\n");
}

describe("size limit (max-lines)", () => {
  const rule = "max-lines";

  it("warns on a component over 120 lines of code", async () => {
    const found = await warningsFor(rule, codeLines(121), "components/games/too-long.tsx");
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe(1);
  });

  it("warns on a route file over 120 lines of code", async () => {
    const found = await warningsFor(rule, codeLines(121), "app/(protected)/games/page.tsx");
    expect(found).toHaveLength(1);
  });

  it("does not count blank lines or comments", async () => {
    const padded = `${codeLines(120)}\n\n\n// a comment\n/*\n * a block comment\n */\n`;
    expect(await warningsFor(rule, padded, "components/games/padded.tsx")).toEqual([]);
  });

  it.each([
    "components/ui/sidebar.tsx",
    "app/actions/games.ts",
    "lib/api.ts",
    "hooks/use-thing.ts",
  ])("exempts %s", async (file) => {
    expect(await warningsFor(rule, codeLines(200), file)).toEqual([]);
  });
});

describe("raw-element ban (structure/no-raw-controls)", () => {
  const rule = "structure/no-raw-controls";

  it.each(["button", "input", "select", "textarea", "table"])(
    "warns on a raw <%s> in feature code",
    async (tag) => {
      const code = `export function Bad() {\n  return <${tag} className="mt-2" />;\n}\n`;
      const found = await warningsFor(rule, code, "components/games/bad.tsx");
      expect(found).toHaveLength(1);
      expect(found[0].severity).toBe(1);
      expect(found[0].line).toBe(2);
    },
  );

  it("allows raw elements inside the primitives", async () => {
    const code = `export function Button() {\n  return <button data-slot="button" />;\n}\n`;
    expect(await warningsFor(rule, code, "components/ui/button.tsx")).toEqual([]);
  });

  it("allows the primitive components themselves", async () => {
    const code = `import { Button } from "@/components/ui/button";\nexport function Ok() {\n  return <Button />;\n}\n`;
    expect(await warningsFor(rule, code, "components/games/ok.tsx")).toEqual([]);
  });

  it("accepts an inline disable comment that gives a reason", async () => {
    const code = [
      "export function Excused() {",
      "  return (",
      "    // eslint-disable-next-line structure/no-raw-controls -- native file picker",
      '    <input type="file" />',
      "  );",
      "}",
    ].join("\n");
    const [result] = await eslint.lintText(code, {
      filePath: path.join(root, "components/games/excused.tsx"),
    });
    expect(result.messages.filter((m) => m.ruleId?.startsWith("structure/"))).toEqual([]);
  });

  it("flags an inline disable comment that gives no reason", async () => {
    const code = [
      "export function Unexcused() {",
      "  return (",
      "    // eslint-disable-next-line structure/no-raw-controls",
      '    <input type="file" />',
      "  );",
      "}",
    ].join("\n");
    const found = await warningsFor(
      "structure/disable-needs-reason",
      code,
      "components/games/unexcused.tsx",
    );
    expect(found).toHaveLength(1);
    expect(found[0].line).toBe(3);
  });
});

describe("look-class ban (structure/no-look-classes-on-primitives)", () => {
  const rule = "structure/no-look-classes-on-primitives";
  const file = "components/games/sample.tsx";

  function sample(jsx: string): string {
    return [
      'import { Button } from "@/components/ui/button";',
      'import { SidebarMenuButton } from "@/components/ui/sidebar";',
      'import { cn } from "@/lib/utils";',
      "export function Sample({ active }: { active: boolean }) {",
      `  return ${jsx};`,
      "}",
    ].join("\n");
  }

  it.each([
    ["background", "bg-gotm"],
    ["text colour", "text-paper-dim"],
    ["role-token text colour", "text-muted-foreground"],
    ["radius", "rounded-none"],
    ["shadow", "shadow-lg"],
    ["border colour", "border-rule"],
    ["side border colour", "border-b-gotm"],
    ["state variant", "hover:bg-ink-2"],
    ["responsive variant", "md:rounded-lg"],
    ["arbitrary colour", "text-[#fff]"],
  ])("warns on a %s class (%s) passed to a primitive", async (_kind, cls) => {
    const found = await warningsFor(rule, sample(`<Button className="mt-2 ${cls}" />`), file);
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe(1);
    expect(found[0].message).toContain(cls);
  });

  it("allows layout, size, type-size and border-width classes", async () => {
    const layout =
      "mt-2 w-full flex items-center gap-2 grid-cols-2 text-sm text-center text-[13px] border border-t-2 border-dashed";
    expect(await warningsFor(rule, sample(`<Button className="${layout}" />`), file)).toEqual([]);
  });

  it("finds look classes inside cn() and template literals", async () => {
    const viaCn = sample('<Button className={cn("w-full", active && "bg-ink")} />');
    const viaTemplate = sample("<SidebarMenuButton className={`px-2 ${active ? \"rounded-full\" : \"\"}`} />");
    expect(await warningsFor(rule, viaCn, file)).toHaveLength(1);
    expect(await warningsFor(rule, viaTemplate, file)).toHaveLength(1);
  });

  it("ignores elements that are not primitives", async () => {
    expect(await warningsFor(rule, sample('<div className="bg-ink rounded-lg" />'), file)).toEqual([]);
  });

  it("lets the primitives style each other", async () => {
    expect(
      await warningsFor(rule, sample('<Button className="bg-ink" />'), "components/ui/sidebar.tsx"),
    ).toEqual([]);
  });
});

describe("palette-name ban (structure/no-palette-colors)", () => {
  const rule = "structure/no-palette-colors";

  it.each([
    ["ink", '<div className="bg-ink" />'],
    ["ink-2", '<div className="hover:bg-ink-2" />'],
    ["ink-3", '<div className="bg-ink-3/80" />'],
    ["paper", '<p className="text-paper" />'],
    ["paper-dim", '<p className="text-paper-dim" />'],
    ["paper-mute", '<p className="placeholder:text-paper-mute" />'],
    ["rule", '<hr className="border-t border-rule" />'],
    ["rule-strong", '<hr className="divide-rule-strong" />'],
    ["paper-dim", '<p style={{ color: "var(--color-paper-dim)" }} />'],
    ["ink", "<p className={`px-2 ${\"ring-ink\"}`} />"],
  ])("warns on the palette name %s outside the themes", async (name, jsx) => {
    const code = `export function Bad() {\n  return ${jsx};\n}\n`;
    const found = await warningsFor(rule, code, "components/games/bad.tsx");
    expect(found).toHaveLength(1);
    expect(found[0].severity).toBe(1);
    expect(found[0].message).toContain(name);
  });

  it("covers the primitives and library code too", async () => {
    const code = 'export const tone = { quiet: "bg-ink-2 text-paper-dim" };\n';
    expect(await warningsFor(rule, code, "components/ui/button.tsx")).toHaveLength(1);
    expect(await warningsFor(rule, code, "lib/achievements.ts")).toHaveLength(1);
  });

  it("leaves role tokens, club colours and prose alone", async () => {
    const code = [
      'export const a = "bg-background text-foreground border-border";',
      'export const b = "bg-highlight text-highlight-ink bg-destructive text-destructive-ink";',
      'export const c = "The ink is dry, paper is cheap, rule of thumb.";',
    ].join("\n");
    expect(await warningsFor(rule, code, "components/games/ok.tsx")).toEqual([]);
  });

  it("allows palette names inside a Theme", async () => {
    const code = 'export const surface = "bg-ink text-paper";\n';
    expect(await warningsFor(rule, code, "themes/monthly-issue/tokens.ts")).toEqual([]);
  });
});
