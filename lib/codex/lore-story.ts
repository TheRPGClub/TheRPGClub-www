import type { TElement, Value } from "platejs";

import { emptyRichTextValue, paragraph } from "@/lib/rich-text/text";
import { IMAGE_TYPE, MENTION_TYPE, sanitizeStory, type ImageNode } from "./story-schema";
import type { CodexEntry, CodexMember } from "./types";

// A Lore Entry's story and its images (design 3D, picks.md "Inline images").
// The images live in the story as image nodes between blocks; the entry's
// `images` list is the set uploaded. These rules place, find and lay out
// those nodes, for the desk and for the Lore Entry page.

type Node = Record<string, unknown>;

export function isImageNode(node: unknown): node is ImageNode {
  return node != null && typeof node === "object" && (node as Node).type === IMAGE_TYPE;
}

// Which photo a node is: an uploaded image by id, a pending one by key.
export type PhotoKey = { id: number } | { pendingKey: string };

function matches(node: ImageNode, key: PhotoKey): boolean {
  return "id" in key ? node.id === key.id : node.pendingKey === key.pendingKey;
}

// Where each image sits: the top-level index of its node, or -1.
export function imageIndex(value: Value, key: PhotoKey): number {
  return value.findIndex((node) => isImageNode(node) && matches(node, key));
}

// "After paragraph 3": the count of blocks before the image that aren't
// images, so it reads as the writer counts. Null when it isn't placed.
export function paragraphBefore(value: Value, key: PhotoKey): number | null {
  const at = imageIndex(value, key);
  if (at < 0) return null;
  return value.slice(0, at).filter((node) => !isImageNode(node)).length;
}

// The ids of the uploaded images the story places, in story order.
export function storyImageIds(value: readonly unknown[]): number[] {
  const ids: number[] = [];
  for (const node of value) {
    if (isImageNode(node) && typeof node.id === "number" && !ids.includes(node.id)) ids.push(node.id);
  }
  return ids;
}

// The story with each pending image swapped for its upload (`uploaded` maps
// a pending key to the image the API returned). A pending image not uploaded
// yet stays as it is; the sanitizer drops it from what is saved.
export function resolvePending(value: Value, uploaded: ReadonlyMap<string, { id: number; url: string }>): Value {
  return value.map((node) => {
    if (!isImageNode(node) || !node.pendingKey) return node;
    const image = uploaded.get(node.pendingKey);
    if (!image) return node;
    const { pendingKey: _drop, ...rest } = node;
    void _drop;
    return { ...rest, id: image.id, url: image.url } as TElement;
  });
}

// The pending keys the story places, in story order.
export function storyPendingKeys(value: Value): string[] {
  return value.flatMap((node) => (isImageNode(node) && node.pendingKey ? [node.pendingKey] : []));
}

// Mentions renamed to the members' current names (from the entry's
// `mentions`), at any depth.
export function withCurrentNames<T>(nodes: T[], mentions: Readonly<Record<string, CodexMember>>): T[] {
  return nodes.map((node) => {
    if (node == null || typeof node !== "object") return node;
    const record = node as Node;
    if (record.type === MENTION_TYPE && typeof record.userId === "string" && Object.hasOwn(mentions, record.userId)) {
      return { ...record, value: mentions[record.userId].name } as T;
    }
    if (Array.isArray(record.children)) return { ...record, children: withCurrentNames(record.children, mentions) } as T;
    return node;
  });
}

// The story the desk opens with: the entry's (its photos the entry still
// has, its mentions under current names), a story saved without one read
// from `body` a paragraph at a time, or an empty page.
export function readStory(entry: CodexEntry | null): Value {
  if (!entry) return emptyRichTextValue();
  const known = new Set(entry.images.map((image) => image.id));
  const story =
    sanitizeStory(entry.rich_body) ??
    (entry.body?.trim() ? entry.body.split(/\n{2,}/).map((text) => paragraph(text.trim())) : null);
  if (!story) return emptyRichTextValue();
  const kept = story.filter((node) => !isImageNode(node) || (typeof node.id === "number" && known.has(node.id)));
  return withCurrentNames(kept, entry.mentions);
}

// ---- The Lore Entry page's spread ----

export interface SpreadPhoto {
  id: number;
  url: string;
  caption: string | null;
  // Degrees, from its place in the gallery.
  tilt: number;
}

export interface SpreadBlock {
  node: TElement;
  // 1-based grid row.
  row: number;
  // The photos taped beside it, and which margin they sit in.
  photos: SpreadPhoto[];
  side: "left" | "right";
  // How far down from the block's top the photos start, in px.
  offset: number;
  opening: boolean;
  last: boolean;
}

const TILTS = [2.5, -3, 3.5, -2];
// Rough heights for the room the last photos need below the story: a taped
// photo with its caption, and a block of the story.
const PHOTO_HEIGHT = 300;
const PHOTO_GAP = 24;
const BLOCK_HEIGHT = 80;
const OFFSETS = [8, 72, 28, 130];

// How far the last taped photos run past the story's end, in px (roughly),
// so the page leaves room for them: photos hang beside the story without
// pushing its blocks apart.
export function spreadTail(blocks: readonly SpreadBlock[]): number {
  let tail = 0;
  blocks.forEach((block, i) => {
    if (block.photos.length === 0) return;
    const height = block.offset + block.photos.length * (PHOTO_HEIGHT + PHOTO_GAP);
    tail = Math.max(tail, height - (blocks.length - i) * BLOCK_HEIGHT);
  });
  return Math.max(0, Math.round(tail));
}

// The story laid out as 3D draws it: each block on its own row, each image
// taped in a margin beside the block before it (an image before the first
// block goes beside the first), alternating right, left, right. A photo
// next to a pull quote (or just before one) moves left, since the quote
// spans the right margin. Images the entry no longer has are left out.
export function spreadLayout(value: readonly unknown[], images: CodexEntry["images"]): SpreadBlock[] {
  const known = new Map(images.map((image) => [image.id, image]));
  const blocks: SpreadBlock[] = [];
  const before: SpreadPhoto[] = [];
  for (const node of value) {
    if (node == null || typeof node !== "object") continue;
    if (isImageNode(node)) {
      const image = typeof node.id === "number" ? known.get(node.id) : undefined;
      if (!image) continue;
      const photo = {
        id: image.id,
        url: image.url,
        caption: typeof node.caption === "string" && node.caption.trim() ? node.caption.trim() : null,
        tilt: TILTS[(image.position - 1) % TILTS.length] ?? TILTS[0],
      };
      (blocks.at(-1)?.photos ?? before).push(photo);
      continue;
    }
    blocks.push({ node: node as TElement, row: blocks.length + 1, photos: [], side: "right", offset: 8, opening: false, last: false });
  }
  if (blocks.length === 0) return blocks;
  blocks[0].photos.unshift(...before);
  if (blocks[0].node.type === "p") blocks[0].opening = true;
  blocks.at(-1)!.last = true;

  let next: "left" | "right" = "right";
  let group = 0;
  blocks.forEach((block, i) => {
    if (block.photos.length === 0) return;
    const nearQuote = block.node.type === "blockquote" || blocks[i + 1]?.node.type === "blockquote";
    block.side = nearQuote ? "left" : next;
    block.offset = OFFSETS[group % OFFSETS.length];
    next = block.side === "right" ? "left" : "right";
    group += 1;
  });
  return blocks;
}

// ---- The shelf's slide-out ----

function inlineText(node: unknown): string {
  if (node == null || typeof node !== "object") return "";
  const record = node as Node;
  if (record.type === MENTION_TYPE) return typeof record.userId === "string" ? `<@${record.userId}>` : "";
  if (typeof record.text === "string") return record.text;
  return Array.isArray(record.children) ? record.children.map(inlineText).join("") : "";
}

// The story's opening for the slide-out: its first paragraph's text, mentions
// as `<@id>` tokens (the Fun Fact reader shows them as names), cut to whole
// sentences within about `max` characters (or at a word with "…" when the
// first sentence alone is longer).
export function storyOpening(value: readonly unknown[] | null, max = 240): string {
  const first = (value ?? []).find((node) => (node as Node | null)?.type === "p" && inlineText(node).trim());
  const text = inlineText(first).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break;
    out += sentence;
  }
  if (out.trim()) return out.trim();
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 1)).replace(/[\s,;:.]+$/, "")}…`;
}

// ---- The Lore Entry page's masthead and photos ----

// A taped photo's caption split into its label and its words: a leading time
// ("23:12 The command.") or a short lead before a colon ("Next morning: The
// apology cake.") is the label.
export function captionParts(caption: string): { label: string | null; text: string } {
  const time = /^(\d{1,2}:\d{2})\s+([\s\S]+)$/.exec(caption);
  if (time) return { label: time[1], text: time[2] };
  const lead = /^([^:]{1,24}):\s+([\s\S]+)$/.exec(caption);
  if (lead && !/^https?$/i.test(lead[1])) return { label: lead[1], text: lead[2] };
  return { label: null, text: caption };
}

// A title as the masthead sets it (3D): two lines, the second (which takes
// the Club Lore jade) starting at the last word boundary that leaves it at
// least a third of the title. A short or one-word title stays on one line.
export function titleLines(title: string): [string] | [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length < 2 || title.trim().length <= 14) return [title.trim()];
  const third = words.join(" ").length / 3;
  let at = 1;
  for (let i = words.length - 1; i >= 1; i--) {
    if (words.slice(i).join(" ").length >= third) {
      at = i;
      break;
    }
  }
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}
