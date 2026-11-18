import type { Value } from "platejs";

import { LINK_TYPE } from "@/lib/rich-text/schema";
import { SPOILER_KEY } from "@/lib/rich-text/spoiler-plugin";
import { LORE_SCHEMA, MENTION_TYPE, sanitizeStory } from "./story-schema";
import type { RichTextSchema } from "@/lib/rich-text/schema";

// A Club Codex `body` (Discord markdown) read back into a story, for an
// entry saved without `rich_body`: one the bot or an import wrote. It is the
// reverse of lib/codex/discord-markdown.ts, so the desk opens such an entry
// with its formatting and mentions in place, and saving it unchanged writes
// the same `body` back:
// - `#`, `##`, `###` lines become headings, `> ` lines a quote, `- ` and
//   `1. ` lines lists (two spaces a level), the rest paragraphs, blocks a
//   blank line apart;
// - `**`, `*` (or `_`), `~~` and `||` become bold, italic, strikethrough and
//   spoiler; `<@id>` a mention; `[text](url)` and `<url>` links;
// - a backslash before punctuation keeps it as written.
// The result goes through the sanitizer like anything else the desk loads.

type Node = Record<string, unknown>;
type Marks = Record<string, true>;

// An escaped punctuation character stands in as a private-use one while the
// markdown is read, so it never reads as markup, and turns back after.
const HIDDEN = 0xe000;
const hide = (body: string) => body.replace(/\\([!-/:-@[-`{-~])/g, (_, c: string) => String.fromCharCode(HIDDEN + c.charCodeAt(0)));
const reveal = (text: string) => text.replace(/[-]/g, (c) => String.fromCharCode(c.charCodeAt(0) - HIDDEN));

const MARKERS: [string, string][] = [
  ["||", SPOILER_KEY],
  ["**", "bold"],
  ["~~", "strikethrough"],
  ["*", "italic"],
  ["_", "italic"],
];

// Where the marker opened before `from` closes: the end of the first run of
// its character, after some words, that is long enough. -1 when it doesn't.
function closing(s: string, from: number, marker: string): number {
  for (let j = from + 1; j < s.length; j++) {
    if (!s.startsWith(marker, j) || /\s/.test(s[j - 1])) continue;
    let end = j;
    while (s[end + marker.length] === marker[0]) end++;
    return end;
  }
  return -1;
}

function inline(s: string, marks: Marks, out: Node[]): Node[] {
  let text = "";
  const flush = () => {
    if (text) out.push({ text: reveal(text), ...marks });
    text = "";
  };
  for (let i = 0; i < s.length; ) {
    const rest = s.slice(i);
    let m: RegExpExecArray | null;
    if ((m = /^<@!?(\d{1,20})>/.exec(rest))) {
      flush();
      out.push({ type: MENTION_TYPE, userId: m[1], value: "", children: [{ text: "" }] });
      i += m[0].length;
      continue;
    }
    if ((m = /^<(https?:\/\/[^\s>]+)>/.exec(rest)) || (m = /^\[([^\]]*)\]\(<?([^\s)>]+)>?\)/.exec(rest))) {
      flush();
      const url = reveal(m[2] ?? m[1]);
      const children = m[2] ? inline(m[1], marks, []) : [{ text: url, ...marks }];
      out.push({ type: LINK_TYPE, url, children });
      i += m[0].length;
      continue;
    }
    const marker = MARKERS.find(([mark]) => rest.startsWith(mark) && rest[mark.length] && !/\s/.test(rest[mark.length]));
    const close = marker ? closing(s, i + marker[0].length, marker[0]) : -1;
    if (marker && close > 0) {
      flush();
      inline(s.slice(i + marker[0].length, close), { ...marks, [marker[1]]: true }, out);
      i = close + marker[0].length;
      continue;
    }
    text += s[i];
    i += 1;
  }
  flush();
  return out;
}

const LIST_LINE = /^( *)(-|\d+\.) (.*)$/;

// A block of list lines as nested lists: each level two spaces in, a line
// indented under an item continuing it.
function list(lines: string[]): Node | null {
  const root: Node[] = [];
  const stack: { depth: number; list: Node; item: Node | null }[] = [];
  for (const line of lines) {
    const m = LIST_LINE.exec(line);
    if (!m) {
      const lic = (stack.at(-1)?.item?.children as Node[] | undefined)?.[0];
      if (!lic) return null;
      (lic.children as Node[]).push({ text: "\n" }, ...inline(line.trim(), {}, []));
      continue;
    }
    const depth = Math.floor(m[1].length / 2);
    const type = m[2] === "-" ? "ul" : "ol";
    while (stack.length > 0 && stack.at(-1)!.depth > depth) stack.pop();
    let top = stack.at(-1);
    if (!top || top.depth < depth || top.list.type !== type) {
      if (top && top.depth === depth) stack.pop();
      const fresh: Node = { type, children: [] };
      const parent = stack.at(-1)?.item;
      if (parent) (parent.children as Node[]).push(fresh);
      else root.push(fresh);
      top = { depth, list: fresh, item: null };
      stack.push(top);
    }
    const item: Node = { type: "li", children: [{ type: "lic", children: inline(m[3], {}, []) }] };
    (top.list.children as Node[]).push(item);
    top.item = item;
  }
  return root.length === 1 ? root[0] : null;
}

function block(text: string): Node[] {
  const lines = text.split("\n");
  const heading = /^(#{1,3}) (.+)$/.exec(text);
  if (heading && lines.length === 1) return [{ type: `h${heading[1].length}`, children: inline(heading[2], {}, []) }];
  if (lines.every((line) => line.startsWith(">"))) {
    const inner = lines.map((line) => line.replace(/^> ?/, "")).join("\n");
    const paragraphs = inner.split(/\n\s*\n/).map((p) => ({ type: "p", children: inline(p, {}, []) }));
    return [{ type: "blockquote", children: paragraphs }];
  }
  if (LIST_LINE.test(lines[0])) {
    const parsed = list(lines);
    if (parsed) return [parsed];
  }
  return [{ type: "p", children: inline(text, {}, []) }];
}

export function discordToStory(body: string, schema: RichTextSchema = LORE_SCHEMA): Value | null {
  const blocks = hide(body.replace(/\r\n?/g, "\n"))
    .split(/\n{2,}/)
    .filter((text) => text.trim())
    .flatMap(block);
  return sanitizeStory(blocks, schema);
}
