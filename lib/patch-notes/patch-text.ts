import { KEYS, type Value } from "platejs";

import { richTextToDiscord, type DiscordOptions } from "@/lib/rich-text/discord-markdown";
import { nodeText } from "@/lib/rich-text/text";

// A Patch's text, as the website card and the #patch-notes post both show it
// (spec api#510, www#235).
//
// Discord caps the post at 4000 characters. A longer Patch is cut at the
// last whole top-level block or list item whose markdown fits within 3997,
// and "..." is added after it. The website card renders `cutValue`, the API
// stores `cutMarkdown` for the bot, and `cutMarkdown` is exactly the
// markdown of `cutValue`, so both looks cut at the same place. The editor's
// counter shows `length`, the full markdown's.
//
// When not even the first block or list item fits, that one is cut at the
// last whole word that fits instead, so a Patch never reads as "..." alone.
// A full stop or ellipsis the kept text ends in gives way to "...", so the
// cut never reads "...."; an empty list item is never where it falls.
//
// It takes a value already through its schema's sanitizer, like the
// converter it wraps.

export const PATCH_POST_MAX = 4000;
export const PATCH_CUT_MARK = "...";
export const PATCH_CUT_AT = PATCH_POST_MAX - PATCH_CUT_MARK.length;

export interface PatchText {
  // The whole Patch as Discord markdown: the API's `body`.
  markdown: string;
  // The Patch as the card and the post show it: the value itself when it
  // fits, else the cut ending in "...".
  cutValue: Value;
  cutMarkdown: string;
  cut: boolean;
  // `markdown`'s length, which the editor counts against 4000.
  length: number;
}

type Node = Record<string, unknown>;
// A cut point: the indices from the top level down to the block or list
// item the cut keeps last, whole.
type Path = number[];

function children(node: Node): Node[] {
  return Array.isArray(node.children) ? (node.children as Node[]) : [];
}

function isList(node: Node): boolean {
  return node.type === KEYS.ulClassic || node.type === KEYS.olClassic;
}

// Each list item's cut points, in reading order: the items of its nested
// lists, then the item whole.
function itemPaths(list: Node, at: Path): Path[] {
  return children(list).flatMap((item, i) => [
    ...children(item).flatMap((child, c) => (isList(child) ? itemPaths(child, [...at, i, c]) : [])),
    [...at, i],
  ]);
}

function cutPoints(value: Node[]): Path[] {
  return value.flatMap((block, i) => [...(isList(block) ? itemPaths(block, [i]) : []), [i]]);
}

// Everything up to and including the node at `path`.
function prefix(nodes: Node[], path: Path): Node[] {
  const [at, ...rest] = path;
  const kept = nodes.slice(0, at);
  return rest.length > 0 ? [...kept, { ...nodes[at], children: prefix(children(nodes[at]), rest) }] : [...kept, nodes[at]];
}

// A full stop or ellipsis the kept text ends in, which "..." replaces so
// the cut never reads as "...." ("!" and "?" stay: "Done!...").
const SENTENCE_STOP = /[.\u2026]+\s*$/;

function withoutStop(kids: Node[]): Node[] {
  const last = kids.at(-1);
  if (typeof last?.text !== "string" || !SENTENCE_STOP.test(last.text)) return kids;
  return [...kids.slice(0, -1), { ...last, text: last.text.replace(SENTENCE_STOP, "") }];
}

// "..." as an unmarked text at the end of the last block holding text.
function withMark(nodes: Node[]): Node[] {
  const last = nodes.at(-1);
  if (!last) return [{ type: "p", children: [{ text: PATCH_CUT_MARK }] }];
  const kids = children(last);
  const marked = kids.some((child) => typeof child.text === "string")
    ? [...withoutStop(kids), { text: PATCH_CUT_MARK }]
    : withMark(kids);
  return [...nodes.slice(0, -1), { ...last, children: marked }];
}

function nodeAt(nodes: Node[], path: Path): Node {
  const [at, ...rest] = path;
  return rest.length > 0 ? nodeAt(children(nodes[at]), rest) : nodes[at];
}

// The first `budget` characters of text, in reading order; elements after
// the last kept character are dropped.
function keepText(nodes: Node[], budget: number): { nodes: Node[]; budget: number; done: boolean } {
  const out: Node[] = [];
  for (const node of nodes) {
    if (typeof node.text === "string") {
      if (node.text.length > budget) {
        out.push({ ...node, text: node.text.slice(0, budget) });
        return { nodes: out, budget: 0, done: true };
      }
      out.push(node);
      budget -= node.text.length;
      continue;
    }
    const inner = keepText(children(node), budget);
    if (inner.nodes.length > 0) out.push({ ...node, children: inner.nodes });
    budget = inner.budget;
    if (inner.done) return { nodes: out, budget, done: true };
  }
  return { nodes: out, budget, done: false };
}

// The first block, or first list item, cut at the last word that fits.
function cutWithinWords(first: Node, fits: (nodes: Node[]) => boolean): Node[] {
  const text = nodeText(first);
  const cutAt = (k: number) => withMark(keepText([first], k).nodes);
  let low = 0;
  let high = text.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (fits(cutAt(mid))) low = mid;
    else high = mid - 1;
  }
  const space = /\s/.test(text[low] ?? " ") ? low : text.slice(0, low).search(/\s\S*$/);
  return cutAt(space > 0 ? space : low);
}

export function patchText(value: Value, options: DiscordOptions = {}): PatchText {
  const markdown = richTextToDiscord(value, options);
  const whole = { markdown, cutValue: value, cutMarkdown: markdown, cut: false, length: markdown.length };
  if (markdown.length <= PATCH_POST_MAX) return whole;

  const nodes = value as unknown as Node[];
  const fits = (cut: Node[]) => richTextToDiscord(cut, options).length <= PATCH_POST_MAX;
  // A block Discord would not show (an empty paragraph) or an empty list
  // item is never where the cut falls, so "..." always follows words.
  const shown = (node: Node) => richTextToDiscord([node], options) !== "";
  let best: Node[] | null = null;
  for (const path of cutPoints(nodes)) {
    if (path.length === 1 ? !shown(nodes[path[0]]) : nodeText(nodeAt(nodes, path)).trim() === "") continue;
    const cut = withMark(prefix(nodes, path));
    if (!fits(cut)) break;
    best = cut;
  }
  const first = nodes.findIndex(shown);
  const cutNodes = best ?? [...nodes.slice(0, first), ...cutWithinWords(nodes[first], fits)];
  const cutValue = cutNodes as unknown as Value;
  return { ...whole, cutValue, cutMarkdown: richTextToDiscord(cutValue, options), cut: true };
}
