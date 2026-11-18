import { sanitizeUrl } from "./url";

// What a rich-text field may hold. Every feature that stores a Plate value
// (Reviews, and later the Club Codex) describes its field with one of these,
// and the same object drives the sanitizer (`sanitizeRichText`), the editor's
// length limit and which toolbar buttons show.
//
// The value arrives from the client as untrusted JSON and is rendered back as
// markup, so the allowlist is the security boundary, not just a schema.

// The children a block may hold: inline content (text, plus the schema's
// inline elements), or a list of the block types allowed inside it.
export type BlockRule = "inline" | readonly string[];

// An inline element (a link; later a mention). `props` vets the element's own
// properties from untrusted JSON and returns the ones to keep, or null when
// the element is not valid. An element that fails degrades to its text, so a
// value never silently loses words.
export interface InlineRule {
  props: (node: Record<string, unknown>) => Record<string, unknown> | null;
}

export interface RichTextSchema {
  // Boolean marks a text node may carry.
  marks: readonly string[];
  // Block types, mapped to the children each may hold. `p` must be present:
  // an unknown block's words are kept as a paragraph.
  blocks: Readonly<Record<string, BlockRule>>;
  // Inline element types, mapped to their rule.
  inlines: Readonly<Record<string, InlineRule>>;
  // Plain-text length limit (see `richTextPlainText`). The editor enforces it
  // while typing; a server action checks it again.
  maxLength: number;
}

export const PARAGRAPH_TYPE = "p";
export const LINK_TYPE = "a";

// The marks the shared editor and renderer understand.
export const RICH_TEXT_MARKS = [
  "bold",
  "italic",
  "strikethrough",
  "spoiler",
] as const;

// The blocks the shared editor and renderer understand.
//
// Classic lists nest as ul/ol > li > lic (list item content), which is why
// `li` allows a nested list alongside its content block.
//
// `blockquote` holds `p`, not inline content directly: Plate's
// BaseBlockquotePlugin normalizes every blockquote's children into a
// paragraph on each edit (see its `normalizeNode` override), so that's the
// shape the editor actually saves.
export const RICH_TEXT_BLOCKS = {
  p: "inline",
  h1: "inline",
  h2: "inline",
  h3: "inline",
  blockquote: ["p"],
  lic: "inline",
  li: ["lic", "ul", "ol"],
  ul: ["li"],
  ol: ["li"],
} as const satisfies Record<string, BlockRule>;

// A link keeps only a URL that passes `sanitizeUrl`.
export const linkRule: InlineRule = {
  props: (node) => {
    const url = sanitizeUrl(node.url);
    return url ? { url } : null;
  },
};

// The inline elements the shared editor and renderer understand.
export const RICH_TEXT_INLINES = {
  [LINK_TYPE]: linkRule,
} as const satisfies Record<string, InlineRule>;
