import type { TElement, TText, Value } from "platejs";

import {
  RICH_TEXT_BLOCKS,
  RICH_TEXT_INLINES,
  RICH_TEXT_MARKS,
  type RichTextSchema,
} from "@/lib/rich-text/schema";
import { ensureInline, sanitizeRichText } from "@/lib/rich-text/sanitize";
import {
  emptyRichTextValue,
  paragraph,
  richTextPlainText,
} from "@/lib/rich-text/text";
import type { ReviewBody } from "./types";

// A review body is a rich-text value under REVIEW_SCHEMA. The shared pieces
// (schema, sanitizer, plain-text helpers) live in lib/rich-text; what stays
// here is Review-only: reading the older body shapes and the card excerpt.

// What a review may hold: every shared block, mark and link, at 8000
// characters.
export const MAX_REVIEW_LENGTH = 8000;

export const REVIEW_SCHEMA: RichTextSchema = {
  marks: RICH_TEXT_MARKS,
  blocks: RICH_TEXT_BLOCKS,
  inlines: RICH_TEXT_INLINES,
  maxLength: MAX_REVIEW_LENGTH,
};

/**
 * Validate untrusted JSON into a review value, or null when it holds no text.
 * See `sanitizeRichText`.
 */
export function sanitizeReviewValue(value: unknown): Value | null {
  return sanitizeRichText(value, REVIEW_SCHEMA);
}

// `user_game_reviews.body` is a jsonb column, so the wire value is whatever
// JSON was written to it. Three shapes exist:
//
//   1. A Plate value (array of nodes) — what this app writes now.
//   2. A bare JSON string — what it wrote before the editor landed.
//   3. An object (`{"summary": "..."}`) from the pre-web import.
//
// Everything reading a body goes through here, so the render and edit paths
// never have to know which era a row is from.
const TEXT_KEYS = ["summary", "text", "body", "content"] as const;

// Legacy plain text: split on blank lines so each becomes its own paragraph,
// and leave single newlines inside the text. The static renderer keeps
// `whitespace-pre-wrap` on paragraphs, so those still break where they used
// to and an imported review reads exactly as it did before.
function textToValue(text: string): Value {
  const blocks = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
  return blocks.length > 0 ? blocks.map(paragraph) : emptyRichTextValue();
}

function legacyText(body: ReviewBody): string | null {
  if (body == null) return null;
  if (typeof body === "string") return body.trim() || null;
  if (typeof body === "object" && !Array.isArray(body)) {
    for (const key of TEXT_KEYS) {
      const value = (body as Record<string, unknown>)[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return null;
}

/**
 * Any stored body, normalized to a Plate value for the editor and the static
 * renderer. Always returns at least one block so neither gets an empty array.
 */
export function reviewBodyValue(body: ReviewBody): Value {
  if (Array.isArray(body)) {
    const value = sanitizeReviewValue(body);
    return value ?? emptyRichTextValue();
  }
  const text = legacyText(body);
  return text ? textToValue(text) : emptyRichTextValue();
}

/**
 * Plain text of any stored body, or null when there is nothing to show. Callers
 * that render a preview rather than the full body use this.
 */
export function reviewBodyText(body: ReviewBody): string | null {
  if (Array.isArray(body)) {
    return richTextPlainText(body as Value) || null;
  }
  return legacyText(body);
}

// A card preview is bounded by trimming the value rather than the rendered
// text: whole blocks are kept until the budget runs out, and the block that
// breaches it is cut at a word boundary. That keeps real formatting on the
// card, bounds the DOM, and needs no line-clamp — which cannot measure across
// nested block children reliably anyway.
const EXCERPT_CHARS = 240;
const EXCERPT_BLOCKS = 4;

export interface ReviewExcerpt {
  value: Value;
  // True when anything was left out, so the card can offer the rest.
  truncated: boolean;
}

// Cuts inline children to `budget` characters of text, preferring the last
// word boundary so a preview never ends mid-word. Marks are preserved, so a
// bold or spoiler run that survives the cut stays bold or hidden.
function truncateInline(
  nodes: unknown[],
  budget: number,
): { children: (TElement | TText)[]; used: number; cut: boolean } {
  const children: (TElement | TText)[] = [];
  let used = 0;
  let cut = false;

  for (const node of nodes) {
    if (used >= budget) {
      cut = true;
      break;
    }
    if (node == null || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;

    if (typeof record.text === "string") {
      const remaining = budget - used;
      if (record.text.length <= remaining) {
        children.push(record as unknown as TText);
        used += record.text.length;
        continue;
      }
      const slice = record.text.slice(0, remaining);
      const boundary = slice.lastIndexOf(" ");
      const kept = (boundary > remaining * 0.5 ? slice.slice(0, boundary) : slice)
        .trimEnd();
      children.push({ ...(record as object), text: `${kept}…` } as TText);
      used += kept.length;
      cut = true;
      break;
    }

    // A link: keep it whole if it fits, otherwise stop before it rather than
    // leave a half-labelled link.
    const nested = Array.isArray(record.children) ? record.children : [];
    const inner = truncateInline(nested, budget - used);
    if (inner.children.length > 0) {
      children.push({ ...(record as object), children: inner.children } as TElement);
      used += inner.used;
    }
    if (inner.cut) {
      cut = true;
      break;
    }
  }

  return { children, used, cut };
}

/**
 * A bounded, still-formatted version of a body for card previews, plus whether
 * anything was left out.
 */
export function reviewBodyExcerpt(
  body: ReviewBody,
  maxChars: number = EXCERPT_CHARS,
): ReviewExcerpt {
  const value = reviewBodyValue(body);
  const blocks: TElement[] = [];
  let used = 0;
  let truncated = false;

  for (const block of value) {
    if (used >= maxChars || blocks.length >= EXCERPT_BLOCKS) {
      truncated = true;
      break;
    }
    const element = block as TElement;
    const children = Array.isArray(element.children) ? element.children : [];

    // A list keeps its own block shape, so recurse a level to trim its items
    // rather than flattening them into a paragraph.
    if (children.some((child) => isBlockChild(child))) {
      const inner = reviewBodyExcerpt(children as unknown[], maxChars - used);
      if (inner.value.length > 0) {
        blocks.push({ ...element, children: inner.value } as TElement);
        used += richTextPlainText(inner.value).length;
      }
      if (inner.truncated) truncated = true;
      continue;
    }

    const { children: kept, used: spent, cut } = truncateInline(
      children,
      maxChars - used,
    );
    if (kept.length > 0) {
      blocks.push({ ...element, children: ensureInline(kept) });
      used += spent;
    }
    if (cut) {
      truncated = true;
      break;
    }
  }

  if (blocks.length < value.length) truncated = true;

  return {
    value: blocks.length > 0 ? blocks : emptyRichTextValue(),
    truncated,
  };
}

function isBlockChild(child: unknown): boolean {
  if (child == null || typeof child !== "object") return false;
  const type = (child as Record<string, unknown>).type;
  return typeof type === "string" && Object.hasOwn(REVIEW_SCHEMA.blocks, type);
}
