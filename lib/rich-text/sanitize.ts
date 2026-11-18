import type { TElement, TText, Value } from "platejs";

import type { RichTextSchema } from "./schema";
import { nodeText, paragraph, richTextPlainText } from "./text";

// Guards against a hand-crafted payload nesting lists thousands deep; the
// editor cannot produce anything close to this.
const MAX_DEPTH = 8;

/**
 * Validate untrusted JSON into a value of `schema`, or null when it holds no
 * text.
 *
 * The client sends this straight into a jsonb column that is rendered back as
 * markup, so unknown node types, unknown props and unsafe link schemes are
 * dropped here rather than trusted. Text is always preserved where possible:
 * a rejected node contributes its words as a paragraph.
 */
export function sanitizeRichText(
  value: unknown,
  schema: RichTextSchema,
): Value | null {
  if (!Array.isArray(value)) return null;

  const blocks: TElement[] = [];
  for (const node of value) {
    const sanitized = sanitizeBlock(node, 0, schema);
    if (sanitized) blocks.push(sanitized);
  }

  if (blocks.length === 0) return null;
  if (richTextPlainText(blocks).length === 0) return null;
  return blocks;
}

function sanitizeText(
  node: Record<string, unknown>,
  schema: RichTextSchema,
): TText | null {
  if (typeof node.text !== "string") return null;
  const text: TText = { text: node.text };
  for (const mark of schema.marks) {
    if (node[mark] === true) text[mark] = true;
  }
  return text;
}

// Inline content: text nodes, plus the schema's inline elements holding text
// nodes. An element that fails its rule degrades to its own text rather than
// vanishing, so a value never silently loses words.
function sanitizeInline(
  nodes: unknown[],
  depth: number,
  schema: RichTextSchema,
): (TElement | TText)[] {
  const out: (TElement | TText)[] = [];

  for (const node of nodes) {
    if (node == null || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;
    const type = record.type;

    if (typeof type === "string" && Object.hasOwn(schema.inlines, type)) {
      if (depth >= MAX_DEPTH) continue;
      const children = Array.isArray(record.children)
        ? sanitizeInline(record.children, depth + 1, schema)
        : [];
      const texts = children.filter((child) => "text" in child) as TText[];
      if (texts.length === 0) continue;

      const props = schema.inlines[type].props(record);
      if (props) {
        out.push({ type, ...props, children: texts });
      } else {
        out.push(...texts);
      }
      continue;
    }

    const text = sanitizeText(record, schema);
    if (text) out.push(text);
  }

  return out;
}

export function ensureInline(
  children: (TElement | TText)[],
): (TElement | TText)[] {
  return children.length > 0 ? children : [{ text: "" }];
}

function sanitizeBlock(
  node: unknown,
  depth: number,
  schema: RichTextSchema,
): TElement | null {
  if (node == null || typeof node !== "object" || Array.isArray(node)) {
    return null;
  }
  const record = node as Record<string, unknown>;
  const type = record.type;

  // A bare text node at block level (or an unknown block) is kept as a
  // paragraph so its words survive.
  if (typeof type !== "string" || !Object.hasOwn(schema.blocks, type)) {
    const text = nodeText(record);
    return text ? paragraph(text) : null;
  }

  const allowed = schema.blocks[type];
  const children = Array.isArray(record.children) ? record.children : [];

  if (allowed === "inline") {
    const inline = sanitizeInline(children, depth + 1, schema);
    return { type, children: ensureInline(inline) };
  }

  if (depth >= MAX_DEPTH) {
    const text = nodeText(record);
    return text ? paragraph(text) : null;
  }

  const blocks: TElement[] = [];
  for (const child of children) {
    const sanitized = sanitizeBlock(child, depth + 1, schema);
    if (!sanitized) continue;
    if (!allowed.includes(sanitized.type)) {
      // A stray block inside a list item: keep its text, drop the wrapper.
      const text = nodeText(sanitized);
      if (text && type === "li") {
        blocks.push({ type: "lic", children: [{ text }] });
      }
      continue;
    }
    blocks.push(sanitized);
  }

  if (blocks.length === 0) return null;

  // An `li` must lead with its content block, or the editor cannot place a
  // cursor in it.
  if (type === "li" && blocks[0].type !== "lic") {
    blocks.unshift({ type: "lic", children: [{ text: "" }] });
  }

  return { type, children: blocks };
}
