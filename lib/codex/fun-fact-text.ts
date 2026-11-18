import type { CodexMember } from "@/lib/codex/types";

// A Fun Fact's text between the API and the page (www#124).
//
// The API stores a Fun Fact with members mentioned as Discord tokens
// (`<@discord_id>`, or the legacy `<@!discord_id>`), and sends each known
// member's current name in `mentions`. On the page a token reads as that
// member; in the form it reads as "@Name", and saving turns each picked
// "@Name" back into its token. The 300-character limit counts the stored
// text, tokens included, so the form counts that too.

export const FUN_FACT_MAX = 300;

const TOKEN = /<@!?(\d{1,20})>/g;

export type FunFactSegment =
  | { kind: "text"; text: string }
  | { kind: "mention"; member: CodexMember };

// The text as runs of plain text and mentioned members. A token for a member
// the API doesn't know stays as its text.
export function funFactSegments(
  body: string,
  mentions: Readonly<Record<string, CodexMember>>,
): FunFactSegment[] {
  const out: FunFactSegment[] = [];
  let last = 0;
  const push = (text: string) => {
    if (!text) return;
    const prev = out.at(-1);
    if (prev?.kind === "text") prev.text += text;
    else out.push({ kind: "text", text });
  };
  for (const match of body.matchAll(TOKEN)) {
    const member = Object.hasOwn(mentions, match[1]) ? mentions[match[1]] : undefined;
    push(body.slice(last, match.index));
    if (member) out.push({ kind: "mention", member });
    else push(match[0]);
    last = match.index + match[0].length;
  }
  push(body.slice(last));
  return out;
}

// The text as plain words: each known member as "@Name".
export function funFactPlain(body: string, mentions: Readonly<Record<string, CodexMember>>): string {
  return funFactSegments(body, mentions)
    .map((s) => (s.kind === "text" ? s.text : `@${s.member.name}`))
    .join("");
}

// A member picked in the form: the name shown and the id saved.
export interface PickedMention {
  id: string;
  name: string;
}

// The stored text as the form shows it, with the members it mentions so a
// save turns their names back into tokens.
export function funFactDraft(
  body: string,
  mentions: Readonly<Record<string, CodexMember>>,
): { text: string; picked: PickedMention[] } {
  const picked = new Map<string, PickedMention>();
  for (const s of funFactSegments(body, mentions)) {
    if (s.kind === "mention") picked.set(s.member.user_id, { id: s.member.user_id, name: s.member.name });
  }
  return { text: funFactPlain(body, mentions), picked: [...picked.values()] };
}

const WORD_CHAR = /[\p{L}\p{N}_]/u;

// The form's text as the API stores it: each "@Name" of a picked member,
// standing as a whole name (not the start of a longer word), becomes
// `<@id>`. Longer names go first, so "@Mog Whisperer" wins over "@Mog".
export function encodeFunFact(text: string, picked: readonly PickedMention[]): string {
  const names = [...picked].filter((p) => p.name).sort((a, b) => b.name.length - a.name.length);
  let out = "";
  let i = 0;
  while (i < text.length) {
    const hit = text[i] === "@" && names.find((p) => text.startsWith(`@${p.name}`, i) && !WORD_CHAR.test(text[i + p.name.length + 1] ?? ""));
    if (hit) {
      out += `<@${hit.id}>`;
      i += hit.name.length + 1;
    } else {
      out += text[i];
      i += 1;
    }
  }
  return out;
}

// The "@..." being typed just before the caret, for the mention picker: where
// its "@" sits and the words after it. Null when the caret isn't in one (an
// "@" starts a mention only at the start or after a space).
export function mentionQuery(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const match = /(^|\s)@([^\s@<>]{0,32})$/u.exec(before);
  if (!match) return null;
  return { start: caret - match[2].length - 1, query: match[2] };
}

// Puts a picked member in place of the "@..." from `start` to the caret,
// followed by a space. Returns the new text and where the caret goes.
export function insertMention(
  text: string,
  start: number,
  caret: number,
  name: string,
): { text: string; caret: number } {
  const after = text.slice(caret);
  const spaced = after.startsWith(" ") ? "" : " ";
  const inserted = `@${name}${spaced}`;
  return { text: text.slice(0, start) + inserted + after, caret: start + inserted.length + (spaced ? 0 : 1) };
}
