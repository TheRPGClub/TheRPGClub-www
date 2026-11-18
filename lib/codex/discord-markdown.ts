import { KEYS } from "platejs";

import { LINK_TYPE } from "@/lib/rich-text/schema";
import { SPOILER_KEY } from "@/lib/rich-text/spoiler-plugin";
import { IMAGE_TYPE, MENTION_TYPE } from "./story-schema";

// A Club Codex story as Discord markdown (spec api#397, www#125): what the
// API stores as `body`, which the bot posts and pulls mentions from.
//
// It walks a value that has been through `sanitizeStory`, so only the node
// types the Codex schema allows reach it:
// - headings become `#`, `##`, `###` lines (the bot pages a Lore Entry at
//   them), a quote `> ` lines, lists `- ` and `1. ` lines, indented two
//   spaces a level;
// - bold, italic, strikethrough and spoiler become `**`, `*`, `~~`, `||`;
// - a mention becomes `<@id>`, a link `[text](url)` (a link to this site made
//   absolute, or its text alone when no site address is known);
// - an image is dropped with its caption: Discord shows a Lore Entry's
//   images from its `images` list.
// Text that would read as markdown is escaped, so it shows as written.

type Node = Record<string, unknown>;

export interface DiscordOptions {
  // This site's origin ("https://therpgclub.com"), for root-relative links.
  siteUrl?: string | null;
}

const MARKS: [string, string][] = [
  [SPOILER_KEY, "||"],
  ["bold", "**"],
  ["italic", "*"],
  ["strikethrough", "~~"],
];

// Markdown characters anywhere in a line, and `<` where it would start a
// mention, channel, emoji, timestamp or slash command token.
//
// `@everyone` and `@here` are left as written: the bot posts every Club
// Codex message with allowed mentions set to none (bot#1562, bot#1563), so
// they never ping.
function escapeText(text: string): string {
  return text.replace(/[\\*_~|`[\]]/g, "\\$&").replace(/<(?=[@#:at/])/g, "\\<");
}

// A line that would read as a heading, subtext, quote or list item. A
// backslash only escapes punctuation in Discord, so an ordered list's
// number keeps its digits and its dot is escaped ("1\. ").
function escapeLineStart(line: string): string {
  return line
    .replace(/^(\s*)(#{1,3} |-# |>|[-+*] )/, "$1\\$2")
    .replace(/^(\s*)(\d+)\. /, "$1$2\\. ");
}

function children(node: Node): Node[] {
  return Array.isArray(node.children) ? (node.children as Node[]) : [];
}

function leaf(node: Node): string {
  const text = escapeText(typeof node.text === "string" ? node.text : "");
  // Markers hug the words: Discord reads `** bold**` as plain text.
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text)!;
  if (!match[2]) return text;
  let core = match[2];
  for (const [mark, marker] of [...MARKS].reverse()) {
    if (node[mark] === true) core = `${marker}${core}${marker}`;
  }
  return `${match[1]}${core}${match[3]}`;
}

function absolute(url: string, siteUrl: string | null | undefined): string | null {
  if (!url.startsWith("/")) return url;
  return siteUrl ? `${siteUrl.replace(/\/+$/, "")}${url}` : null;
}

function inline(nodes: Node[], options: DiscordOptions): string {
  return nodes
    .map((node) => {
      if (node.type === MENTION_TYPE) return typeof node.userId === "string" ? `<@${node.userId}>` : "";
      if (node.type === LINK_TYPE) {
        const text = inline(children(node), options);
        const url = typeof node.url === "string" ? absolute(node.url, options.siteUrl) : null;
        if (!url) return text;
        const bare = text.replace(/\\(.)/g, "$1");
        return bare === url || !bare.trim() ? `<${url}>` : `[${text}](<${url}>)`;
      }
      return leaf(node);
    })
    .join("");
}

// A block's inline content as lines, each escaped at its start.
function lines(node: Node, options: DiscordOptions): string[] {
  return inline(children(node), options).split("\n").map(escapeLineStart);
}

function list(node: Node, depth: number, options: DiscordOptions): string[] {
  const ordered = node.type === KEYS.olClassic;
  const out: string[] = [];
  children(node).forEach((item, i) => {
    const marker = ordered ? `${i + 1}. ` : "- ";
    const pad = "  ".repeat(depth);
    for (const child of children(item)) {
      if (child.type === KEYS.ulClassic || child.type === KEYS.olClassic) {
        out.push(...list(child, depth + 1, options));
      } else {
        const [first = "", ...rest] = lines(child, options);
        out.push(`${pad}${marker}${first}`, ...rest.map((line) => `${pad}${" ".repeat(marker.length)}${line}`));
      }
    }
  });
  return out;
}

const HEADINGS: Record<string, string> = { [KEYS.h1]: "# ", [KEYS.h2]: "## ", [KEYS.h3]: "### " };

function block(node: Node, options: DiscordOptions): string | null {
  const type = typeof node.type === "string" ? node.type : "";
  if (type === IMAGE_TYPE) return null;
  if (Object.hasOwn(HEADINGS, type)) {
    const text = inline(children(node), options).replace(/\s*\n\s*/g, " ").trim();
    return text ? `${HEADINGS[type]}${text}` : null;
  }
  if (type === KEYS.blockquote) {
    const quoted = children(node).flatMap((child) => [...lines(child, options), ""]);
    quoted.pop();
    return quoted.some((line) => line.trim()) ? quoted.map((line) => `> ${line}`).join("\n") : null;
  }
  if (type === KEYS.ulClassic || type === KEYS.olClassic) {
    const out = list(node, 0, options);
    return out.length > 0 ? out.join("\n") : null;
  }
  const text = lines(node, options).join("\n");
  return text.trim() ? text : null;
}

// The story as Discord markdown, blocks a blank line apart.
export function storyToDiscord(value: readonly unknown[], options: DiscordOptions = {}): string {
  return value
    .filter((node): node is Node => node != null && typeof node === "object")
    .map((node) => block(node, options))
    .filter((text): text is string => text !== null)
    .join("\n\n")
    .trim();
}
