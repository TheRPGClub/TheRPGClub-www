import { KEYS, type Value } from "platejs";

import { nodeText } from "@/lib/rich-text/text";

import { patchValue } from "./patch-schema";
import { mergeOrder, pendingChangeLine, PENDING_SECTIONS, type PendingChange } from "./pending-changes";
import { PATCH_POST_MAX, patchText } from "./patch-text";

// Writing a Patch (www#237, spec api#510): what a new Patch starts as, and
// what a save sends. Client-safe and pure, so the editor counts with the
// same text the save stores.

// The API's limit on a title.
export const PATCH_TITLE_MAX = 100;

const line = (text: string) => ({ type: "lic", children: [{ text }] });

// A new Patch: an intro paragraph, then the New, Improved and Fixed
// headings, each over one bullet per covered Pending Change in its section
// (its Patch note line, else its title; oldest first), or one empty bullet
// when none is (www#240).
export function patchTemplate(covered: readonly PendingChange[] = []): Value {
  const merged = mergeOrder(covered);
  return [
    { type: "p", children: [{ text: "" }] },
    ...PENDING_SECTIONS.flatMap((section) => {
      const lines = merged.filter((c) => c.section === section.key).map(pendingChangeLine);
      return [
        { type: "h2", children: [{ text: section.label }] },
        { type: "ul", children: (lines.length > 0 ? lines : [""]).map((l) => ({ type: "li", children: [line(l)] })) },
      ];
    }),
  ] as Value;
}

// Whether `value` is still the template drafted from `covered`, untouched
// (as drafted, or as a save leaves it without its empty bullets): only then
// may ticking redraft it. Once staff write in it, the body and the covers
// list go their own ways.
export function isPatchTemplate(value: unknown, covered: readonly PendingChange[]): boolean {
  const text = JSON.stringify(patchValue(value));
  const template = patchValue(patchTemplate(covered));
  return text === JSON.stringify(template) || text === JSON.stringify(patchValue(dropEmptyItems(template)));
}

// A title as saved: spaces squeezed and trimmed, null when blank.
export function patchTitleField(title: string): string | null {
  const clean = title.replaceAll("\u0000", "").replace(/\s+/g, " ").trim();
  return clean ? clean : null;
}

type Node = Record<string, unknown>;

const HEADINGS = new Set<unknown>([KEYS.h1, KEYS.h2, KEYS.h3, KEYS.h4, KEYS.h5, KEYS.h6]);
const isList = (node: Node) => node.type === KEYS.ulClassic || node.type === KEYS.olClassic;
const kids = (node: Node): Node[] => (Array.isArray(node.children) ? (node.children as Node[]) : []);

// A list without its empty items (an item's nested lists pruned first);
// null when none is left.
function pruneList(list: Node): Node | null {
  const items = kids(list)
    .map((item) => ({ ...item, children: kids(item).flatMap((child) => (isList(child) ? (pruneList(child) ?? []) : [child])) }))
    .filter((item) => nodeText(item).trim() !== "");
  return items.length > 0 ? { ...list, children: items } : null;
}

// The value as saved (www#244 review): empty bullets (the template's, until
// written in) never ship as "- ", and a heading whose list that leaves
// empty, with nothing else under it, goes too.
export function dropEmptyItems(value: Value): Value {
  const out: Node[] = [];
  // The heading whose list just went, while nothing else follows it.
  let orphan: Node | null = null;
  const settle = (next: Node | null) => {
    if (orphan && (next === null || HEADINGS.has(next.type))) out.splice(out.indexOf(orphan), 1);
    orphan = null;
  };
  for (const node of value as unknown as Node[]) {
    if (isList(node)) {
      const list = pruneList(node);
      if (list) {
        orphan = null;
        out.push(list);
      } else if (out.at(-1) && HEADINGS.has(out.at(-1)!.type)) {
        orphan = out.at(-1)!;
      }
      continue;
    }
    settle(node);
    out.push(node);
  }
  settle(null);
  return out as unknown as Value;
}

export interface PatchFields {
  title: string | null;
  rich_body: Value;
  body: string;
  cut_body: string;
}

// The save's `data`: the sanitized value without its empty bullets, its
// whole Discord markdown and the cut markdown the bot posts. `siteUrl`
// makes the site's own links whole, so they work from Discord. A new draft
// (`keepEmpty`) keeps the template's empty bullets to write in.
export function patchFields(
  title: string,
  raw: unknown,
  siteUrl: string | null,
  { keepEmpty = false }: { keepEmpty?: boolean } = {},
): PatchFields {
  const sanitized = patchValue(raw);
  const value = keepEmpty ? sanitized : patchValue(dropEmptyItems(sanitized));
  const text = patchText(value, siteUrl ? { siteUrl } : {});
  return { title: patchTitleField(title), rich_body: value, body: text.markdown, cut_body: text.cutMarkdown };
}

// The editor's counter: "1,284" against "4,000".
export function patchCount(length: number): { count: string; max: string; over: boolean } {
  const format = (n: number) => new Intl.NumberFormat("en-GB").format(n);
  return { count: format(length), max: format(PATCH_POST_MAX), over: length > PATCH_POST_MAX };
}
