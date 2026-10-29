import { reviewBodyValue } from "@/lib/api/review-body";
import type { ReviewBody } from "@/lib/api/types";
import { SPOILER_KEY } from "@/lib/reviews/spoiler-plugin";

// A pull quote lifted from a review, for the "In their words" row. It is
// always the writer's own words, verbatim: a blockquote they set themselves
// when there is one, otherwise the first sentence of their prose that fits
// on a pull quote. Spoiler-marked text never makes it out, and a sentence
// that runs into a spoiler is skipped rather than cut around it.

const MIN_CHARS = 24;
const MAX_CHARS = 150;

type Node = Record<string, unknown>;

// The block's text, or null when any of it is marked as a spoiler.
function cleanText(node: unknown): string | null {
  if (node == null || typeof node !== "object") return "";
  const record = node as Node;
  if (typeof record.text === "string") {
    return record[SPOILER_KEY] ? null : record.text;
  }
  if (!Array.isArray(record.children)) return "";
  let out = "";
  for (const child of record.children) {
    const text = cleanText(child);
    if (text === null) return null;
    out += text;
  }
  return out;
}

function fits(text: string): boolean {
  return text.length >= MIN_CHARS && text.length <= MAX_CHARS;
}

function firstSentence(text: string): string | null {
  const flat = text.replace(/\s+/g, " ").trim();
  const match = flat.match(/^.+?[.!?](?=\s|$)/);
  const sentence = (match ? match[0] : flat).trim();
  return fits(sentence) ? sentence : null;
}

export function reviewPullQuote(body: ReviewBody): string | null {
  const value = reviewBodyValue(body) as Node[];

  for (const block of value) {
    if (block.type !== "blockquote") continue;
    const text = cleanText(block)?.replace(/\s+/g, " ").trim();
    if (text && fits(text)) return text;
  }

  for (const block of value) {
    if (block.type !== undefined && block.type !== "p") continue;
    const text = cleanText(block);
    if (!text) continue;
    const sentence = firstSentence(text);
    if (sentence) return sentence;
  }
  return null;
}
