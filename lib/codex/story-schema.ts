import type { Value } from "platejs";

import {
  IMAGE_TYPE,
  MENTION_TYPE,
  RICH_TEXT_BLOCKS,
  RICH_TEXT_INLINES,
  RICH_TEXT_MARKS,
  type InlineRule,
  type RichTextSchema,
} from "@/lib/rich-text/schema";
import { sanitizeRichText } from "@/lib/rich-text/sanitize";
import { nodeText } from "@/lib/rich-text/text";

// The Club Codex's rich text (spec api#397, www#125): the Reviews formatting,
// plus members mentioned by @ (a mention node carrying their Discord id) and,
// in a Lore Entry's story, its images placed between paragraphs (design 3D).
// History Event descriptions (www#126) use the same mention plugin and
// Discord conversion; they keep their images as a gallery, so their schema
// leaves the image out.

export { IMAGE_TYPE, MENTION_TYPE } from "@/lib/rich-text/schema";
// A story keeps to this much plain text (mentions counted as "@Name").
export const STORY_MAX = 4000;
// The API's cap on a History Event's or Lore Entry's images.
export const IMAGES_MAX = 4;
// A Lore Entry's or History Event's title, as the API caps it.
export const TITLE_MAX = 100;
// A photo's caption in a Lore Entry's story.
export const CAPTION_MAX = 160;
const NAME_MAX = 100;

// A mention: `{ type: "mention", userId, value, children: [{ text: "" }] }`.
// `value` is the name when it was written; a reader shows the member's
// current name from the entry's `mentions`.
export interface MentionNode {
  type: typeof MENTION_TYPE;
  userId: string;
  value: string;
  children: [{ text: "" }];
}

// An image placed in the story: the uploaded image's `id` and `url`, and an
// optional caption. While writing, a photo not yet uploaded has a
// `pendingKey` instead of an `id`; it never reaches the API.
export interface ImageNode {
  type: typeof IMAGE_TYPE;
  id?: number;
  pendingKey?: string;
  url: string;
  caption?: string;
  children: [{ text: "" }];
}

const DISCORD_ID = /^\d{1,20}$/;

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.replaceAll("\u0000", "").replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export const mentionRule: InlineRule = {
  props: (node) => {
    if (typeof node.userId !== "string" || !DISCORD_ID.test(node.userId)) return null;
    return { userId: node.userId, value: cleanText(node.value, NAME_MAX) };
  },
};

// Only an uploaded image survives a save: an https (or http, for a local
// API) URL and a positive id. A pending one is dropped.
export const imageRule: InlineRule = {
  props: (node) => {
    const id = node.id;
    if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) return null;
    if (typeof node.url !== "string") return null;
    let url: URL;
    try {
      url = new URL(node.url);
    } catch {
      return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const caption = cleanText(node.caption, CAPTION_MAX);
    return caption ? { id, url: url.toString(), caption } : { id, url: url.toString() };
  },
};

const BASE: Omit<RichTextSchema, "blocks" | "blockProps"> = {
  marks: RICH_TEXT_MARKS,
  inlines: { ...RICH_TEXT_INLINES, [MENTION_TYPE]: mentionRule },
  maxLength: STORY_MAX,
  // A story of mentions alone still says something.
  isEmpty: (value) => storyPlainText(value).length === 0,
};

// A Lore Entry's story.
export const LORE_SCHEMA: RichTextSchema = {
  ...BASE,
  blocks: { ...RICH_TEXT_BLOCKS, [IMAGE_TYPE]: "inline" },
  blockProps: { [IMAGE_TYPE]: imageRule },
};

// A History Event's description (www#126): mentions, no inline images.
export const DESCRIPTION_SCHEMA: RichTextSchema = { ...BASE, blocks: RICH_TEXT_BLOCKS };

// The text of a node as a reader counts it: a mention as "@Name".
function countedText(node: unknown): string {
  if (node == null || typeof node !== "object") return "";
  const record = node as Record<string, unknown>;
  if (record.type === MENTION_TYPE) return `@${typeof record.value === "string" ? record.value : ""}`;
  if (record.type === IMAGE_TYPE) return "";
  if (Array.isArray(record.children)) return record.children.map(countedText).join("");
  return nodeText(record);
}

// The plain text the 4000 limit counts: blocks on their own lines, images
// left out, mentions as "@Name".
export function storyPlainText(value: Value): string {
  return value
    .filter((node) => node.type !== IMAGE_TYPE)
    .map(countedText)
    .join("\n")
    .trim();
}

// Validates untrusted JSON into a story, or null when it has no words.
export function sanitizeStory(value: unknown, schema: RichTextSchema = LORE_SCHEMA): Value | null {
  return sanitizeRichText(value, schema);
}
