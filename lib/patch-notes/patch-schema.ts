import type { Value } from "platejs";

import { RICH_TEXT_BLOCKS, RICH_TEXT_INLINES, RICH_TEXT_MARKS, type RichTextSchema } from "@/lib/rich-text/schema";
import { sanitizeRichText } from "@/lib/rich-text/sanitize";

// What a Patch may hold: the shared editor's blocks, marks and links, as a
// review does (spec api#510). No images and no mentions. The plain-text
// limit is generous: Discord's 4000 is counted on the markdown, by the
// editor, and never blocks publishing.
export const MAX_PATCH_LENGTH = 20000;

export const PATCH_SCHEMA: RichTextSchema = {
  marks: RICH_TEXT_MARKS,
  blocks: RICH_TEXT_BLOCKS,
  inlines: RICH_TEXT_INLINES,
  maxLength: MAX_PATCH_LENGTH,
};

// A Patch's `rich_body` as the site renders it: sanitized, and empty (no
// blocks) when it holds no text.
export function patchValue(raw: unknown): Value {
  return sanitizeRichText(raw, PATCH_SCHEMA) ?? [];
}
