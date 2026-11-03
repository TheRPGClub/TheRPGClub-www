// Pure helpers behind /admin/synonyms. The rules mirror the API's
// `GamedbSearchSynonymGroup#replace_terms!` (and the bot's), so a save the
// page lets through is not refused for a reason it could have shown first.

import type { SearchSynonymGroup } from "@/lib/api/types";

// The `term_text` column's length.
export const SYNONYM_TERM_MAX = 255;

// The API's (and the bot's) search key: lowercase, letters and digits only.
// Two terms with the same key are the same term.
export function normalizeSynonymTerm(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// A group's terms in the order they were entered (the API lists them A to Z;
// term ids keep the entry order). The first is the entry's headword.
export function orderedSynonymTerms(group: SearchSynonymGroup): string[] {
  return [...group.terms]
    .sort((a, b) => a.term_id - b.term_id)
    .map((t) => t.term_text);
}

// The headword an entry files under: its first-entered term. Groups have no
// name of their own; the bot's quick add enters the base term first.
export function synonymHeadword(group: SearchSynonymGroup): string {
  return orderedSynonymTerms(group)[0] ?? "";
}

export function synonymAlso(group: SearchSynonymGroup): string[] {
  return orderedSynonymTerms(group).slice(1);
}

// Splits typed or pasted text into terms the way the bot's quick add does
// (commas, semicolons, pipes, line breaks) and adds the ones not already in
// `terms` by their search key. Returns the new list; `terms` is unchanged.
export function addSynonymTerms(terms: readonly string[], input: string): string[] {
  const next = [...terms];
  const seen = new Set(terms.map(normalizeSynonymTerm));
  for (const chunk of input.split(/[\n,;|]+/)) {
    const text = chunk.trim();
    if (!text) continue;
    const norm = normalizeSynonymTerm(text);
    if (norm && seen.has(norm)) continue;
    seen.add(norm);
    next.push(text);
  }
  return next;
}

export type SynonymTermsCheck =
  | { ok: true; terms: string[] }
  | { ok: false; error: string };

// The terms as the API will store them (trimmed, blanks dropped, a term with
// the same key as an earlier one dropped), or the reason it would refuse them.
export function checkSynonymTerms(input: readonly string[]): SynonymTermsCheck {
  const terms: string[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    if (typeof raw !== "string") return { ok: false, error: "Terms must be text." };
    const text = raw.trim();
    if (!text) continue;
    if (text.length > SYNONYM_TERM_MAX) {
      return { ok: false, error: `"${text.slice(0, 40)}..." is over ${SYNONYM_TERM_MAX} characters.` };
    }
    const norm = normalizeSynonymTerm(text);
    if (!norm) return { ok: false, error: `"${text}" needs a letter or a number.` };
    if (seen.has(norm)) continue;
    seen.add(norm);
    terms.push(text);
  }
  if (terms.length < 2) {
    return { ok: false, error: "An entry needs a headword and at least one other term." };
  }
  return { ok: true, terms };
}

// The page's look-up: a group matches when one of its terms contains the
// query as typed (case ignored) or by search key, as the API's `?q=` does.
export function synonymGroupMatches(group: SearchSynonymGroup, query: string): boolean {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  const norm = normalizeSynonymTerm(text);
  return group.terms.some(
    (t) => t.term_text.toLowerCase().includes(text) || (norm !== "" && t.term_norm.includes(norm)),
  );
}

// The Undo bar's line: what stops working when the entry goes.
export function synonymDeletedMessage(group: SearchSynonymGroup): string {
  const other = synonymAlso(group)[0];
  return other
    ? `Deleted. Searches for "${other}" stop finding these games.`
    : "Deleted.";
}
