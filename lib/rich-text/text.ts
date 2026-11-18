import type { TElement, Value } from "platejs";

import { PARAGRAPH_TYPE } from "./schema";

// Plain-text helpers for a Plate value, whatever schema it was written under.

export function paragraph(text: string): TElement {
  return { type: PARAGRAPH_TYPE, children: [{ text }] };
}

// The value a new, empty editor starts from.
export function emptyRichTextValue(): Value {
  return [paragraph("")];
}

// The text of any node and its descendants, without separators.
export function nodeText(node: unknown): string {
  if (node == null || typeof node !== "object") return "";
  const record = node as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (Array.isArray(record.children)) {
    return record.children.map(nodeText).join("");
  }
  return "";
}

/**
 * Plain text of a value, for length checks and empty checks. Block-level breaks
 * become newlines so separate blocks don't run together.
 */
export function richTextPlainText(value: Value): string {
  return value.map(nodeText).join("\n").trim();
}

export function isRichTextEmpty(value: Value): boolean {
  return richTextPlainText(value).length === 0;
}
