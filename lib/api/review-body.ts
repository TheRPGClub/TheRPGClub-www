import type { TElement, TText, Value } from "platejs";
import type { ReviewBody } from "./types";

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

// Node types a review may contain. The editor only produces these, and
// `sanitizeReviewValue` rejects anything else — the value arrives from the
// client as untrusted JSON and is rendered back as markup, so the allowlist is
// the security boundary, not just a schema.
export const REVIEW_MARKS = [
  "bold",
  "italic",
  "strikethrough",
  "spoiler",
] as const;

export type ReviewMark = (typeof REVIEW_MARKS)[number];

// Block types, mapped to the children each may hold. Classic lists nest as
// ul/ol > li > lic (list item content), which is why `li` allows a nested list
// alongside its content block.
const BLOCK_CHILDREN = {
  p: "inline",
  h1: "inline",
  h2: "inline",
  h3: "inline",
  blockquote: "inline",
  lic: "inline",
  li: ["lic", "ul", "ol"],
  ul: ["li"],
  ol: ["li"],
} as const;

export type ReviewBlockType = keyof typeof BLOCK_CHILDREN;

export const LINK_TYPE = "a";

// Matches the link plugin's own default. Anything else — `javascript:`,
// `data:`, a bare `//host` — is dropped to text.
const ALLOWED_LINK_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

// Guards against a hand-crafted payload nesting lists thousands deep; the
// editor cannot produce anything close to this.
const MAX_DEPTH = 8;

export const MAX_REVIEW_LENGTH = 8000;

function paragraph(text: string): TElement {
  return { type: "p", children: [{ text }] };
}

export function emptyReviewValue(): Value {
  return [paragraph("")];
}

// Legacy plain text: split on blank lines so each becomes its own paragraph,
// and leave single newlines inside the text. The static renderer keeps
// `whitespace-pre-wrap` on paragraphs, so those still break where they used
// to and an imported review reads exactly as it did before.
function textToValue(text: string): Value {
  const blocks = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
  return blocks.length > 0 ? blocks.map(paragraph) : emptyReviewValue();
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
    return value ?? emptyReviewValue();
  }
  const text = legacyText(body);
  return text ? textToValue(text) : emptyReviewValue();
}

function nodeText(node: unknown): string {
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
export function reviewValueText(value: Value): string {
  return value.map(nodeText).join("\n").trim();
}

/**
 * Plain text of any stored body, or null when there is nothing to show. Callers
 * that render a preview rather than the full body use this.
 */
export function reviewBodyText(body: ReviewBody): string | null {
  if (Array.isArray(body)) {
    return reviewValueText(body as Value) || null;
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
        used += reviewValueText(inner.value).length;
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
    value: blocks.length > 0 ? blocks : emptyReviewValue(),
    truncated,
  };
}

function isBlockChild(child: unknown): boolean {
  if (child == null || typeof child !== "object") return false;
  const type = (child as Record<string, unknown>).type;
  return typeof type === "string" && type in BLOCK_CHILDREN;
}

export function isReviewValueEmpty(value: Value): boolean {
  return reviewValueText(value).length === 0;
}

// Anything of the form `scheme:` at the very start, which is what has to be
// checked against the allowlist before the string is handed to `new URL`.
const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:/i;

function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const url = raw.trim();
  if (url.length === 0) return null;

  // Root-relative links stay relative — a review pointing at /games/123
  // shouldn't be rewritten onto a hardcoded absolute host. `//host` is not
  // relative, it's protocol-relative, so it falls through to be resolved.
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  // A URL with no scheme is what someone typing "example.com" produces; treat
  // it as https rather than resolving it against this site, which would turn
  // an outbound link into a broken internal one.
  const candidate = SCHEME_PREFIX.test(url)
    ? url
    : `https://${url.replace(/^\/\//, "")}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }
  if (!ALLOWED_LINK_SCHEMES.includes(parsed.protocol)) return null;
  // http(s) without a host is not a link to anywhere.
  if (parsed.protocol.startsWith("http") && parsed.hostname.length === 0) {
    return null;
  }
  return parsed.toString();
}

function sanitizeText(node: Record<string, unknown>): TText | null {
  if (typeof node.text !== "string") return null;
  const text: TText = { text: node.text };
  for (const mark of REVIEW_MARKS) {
    if (node[mark] === true) text[mark] = true;
  }
  return text;
}

// Inline content: text nodes, plus links holding text nodes. A link that fails
// URL validation degrades to its own text rather than vanishing, so a review
// never silently loses words.
function sanitizeInline(nodes: unknown[], depth: number): (TElement | TText)[] {
  const out: (TElement | TText)[] = [];

  for (const node of nodes) {
    if (node == null || typeof node !== "object") continue;
    const record = node as Record<string, unknown>;

    if (record.type === LINK_TYPE && depth < MAX_DEPTH) {
      const children = Array.isArray(record.children)
        ? sanitizeInline(record.children, depth + 1)
        : [];
      const texts = children.filter((child) => "text" in child) as TText[];
      if (texts.length === 0) continue;

      const url = sanitizeUrl(record.url);
      if (url) {
        out.push({ type: LINK_TYPE, url, children: texts });
      } else {
        out.push(...texts);
      }
      continue;
    }

    const text = sanitizeText(record);
    if (text) out.push(text);
  }

  return out;
}

function ensureInline(children: (TElement | TText)[]): (TElement | TText)[] {
  return children.length > 0 ? children : [{ text: "" }];
}

function sanitizeBlock(node: unknown, depth: number): TElement | null {
  if (node == null || typeof node !== "object" || Array.isArray(node)) {
    return null;
  }
  const record = node as Record<string, unknown>;
  const type = record.type;

  // A bare text node at block level (or an unknown block) is kept as a
  // paragraph so its words survive.
  if (typeof type !== "string" || !(type in BLOCK_CHILDREN)) {
    const text = nodeText(record);
    return text ? paragraph(text) : null;
  }

  const blockType = type as ReviewBlockType;
  const allowed = BLOCK_CHILDREN[blockType];
  const children = Array.isArray(record.children) ? record.children : [];

  if (allowed === "inline") {
    const inline = sanitizeInline(children, depth + 1);
    return { type: blockType, children: ensureInline(inline) };
  }

  if (depth >= MAX_DEPTH) {
    const text = nodeText(record);
    return text ? paragraph(text) : null;
  }

  const blocks: TElement[] = [];
  for (const child of children) {
    const sanitized = sanitizeBlock(child, depth + 1);
    if (!sanitized) continue;
    if (!(allowed as readonly string[]).includes(sanitized.type)) {
      // A stray block inside a list — keep its text, drop the wrapper.
      const text = nodeText(sanitized);
      if (text && blockType === "li") {
        blocks.push({ type: "lic", children: [{ text }] });
      }
      continue;
    }
    blocks.push(sanitized);
  }

  if (blocks.length === 0) return null;

  // An `li` must lead with its content block, or the editor cannot place a
  // cursor in it.
  if (blockType === "li" && blocks[0].type !== "lic") {
    blocks.unshift({ type: "lic", children: [{ text: "" }] });
  }

  return { type: blockType, children: blocks };
}

/**
 * Validate untrusted JSON into a review value, or null when it holds no text.
 *
 * The client sends this straight into a jsonb column that is rendered back as
 * markup, so unknown node types, unknown props and unsafe link schemes are
 * dropped here rather than trusted. Text is always preserved where possible —
 * a rejected node contributes its words as a paragraph.
 */
export function sanitizeReviewValue(value: unknown): Value | null {
  if (!Array.isArray(value)) return null;

  const blocks: TElement[] = [];
  for (const node of value) {
    const sanitized = sanitizeBlock(node, 0);
    if (sanitized) blocks.push(sanitized);
  }

  if (blocks.length === 0) return null;
  if (reviewValueText(blocks).length === 0) return null;
  return blocks;
}
