import { kindName } from "./history";
import { PART_NAME } from "./paths";
import type { CodexEntry, CodexEntryLink, CodexPart } from "./types";
import { occurredLabel } from "./wall";

// See also (www#127): the links between Club Codex entries, as the forms
// edit them and the pages show them. A link belongs to both entries; the
// API keeps one per pair and replaces an entry's whole list on save
// (`PUT /codex/entries/:id/links`, at most 50).

export const LINKS_MAX = 50;
// How many search results the picker shows at once.
export const PICKER_RESULTS = 8;

export const CODEX_PARTS: readonly CodexPart[] = ["history_event", "lore_entry", "fun_fact"];

export function isCodexPart(value: unknown): value is CodexPart {
  return typeof value === "string" && (CODEX_PARTS as readonly string[]).includes(value);
}

// The part as a See also label names it, and its part ink (codex-inks.md).
export const PART_INK: Record<CodexPart, string> = {
  history_event: "var(--color-codex-history)",
  lore_entry: "var(--color-codex-lore)",
  fun_fact: "var(--color-codex-fact)",
};

// The ids a save sends, in the list's order.
export function linkIds(links: readonly Pick<CodexEntryLink, "id">[]): number[] {
  return links.map((link) => link.id);
}

// Whether two lists link the same entries, whatever their order.
export function sameLinks(a: readonly Pick<CodexEntryLink, "id">[], b: readonly Pick<CodexEntryLink, "id">[]): boolean {
  if (a.length !== b.length) return false;
  const ids = new Set(linkIds(a));
  return b.every((link) => ids.has(link.id));
}

// The list with `link` added at its end (once), unless it is the entry
// itself or the list is full.
export function addLink(links: readonly CodexEntryLink[], link: CodexEntryLink, self: number | null): CodexEntryLink[] {
  if (link.id === self || links.some((l) => l.id === link.id) || links.length >= LINKS_MAX) return [...links];
  return [...links, link];
}

export function removeLink(links: readonly CodexEntryLink[], id: number): CodexEntryLink[] {
  return links.filter((link) => link.id !== id);
}

// The picker's results: never the entry being edited, at most a screenful,
// each marked when it is already linked.
export function pickerResults(
  results: readonly CodexEntryLink[],
  self: number | null,
  links: readonly Pick<CodexEntryLink, "id">[],
): (CodexEntryLink & { linked: boolean })[] {
  const linked = new Set(linkIds(links));
  return results
    .filter((result) => result.id !== self)
    .slice(0, PICKER_RESULTS)
    .map((result) => ({ ...result, linked: linked.has(result.id) }));
}

// The links a page may show. The API already leaves out what the caller
// can't read (a Visitor gets History Events only); a Visitor's page keeps
// to History Events as well, so nothing members-only could ever show.
export function visibleLinks(links: readonly CodexEntryLink[], visitor: boolean): CodexEntryLink[] {
  return links.filter((link) => isCodexPart(link.part) && (!visitor || link.part === "history_event"));
}

// A list from the API, kept to well-formed links.
export function cleanLinks(value: unknown): CodexEntryLink[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (link): link is CodexEntryLink =>
      typeof link === "object" &&
      link !== null &&
      Number.isInteger((link as CodexEntryLink).id) &&
      isCodexPart((link as CodexEntryLink).part) &&
      typeof (link as CodexEntryLink).title === "string",
  );
}

// "2 linked", for the See also card's note.
export function linkedNote(n: number): string | null {
  return n > 0 ? `${n} linked` : null;
}

// A link on the Lore Entry page's jade band (3D), from the linked entry
// when it could be read: the chip (a History Event's Kind, "Lore Entry" or
// "Fun Fact"), then the part and date for a History Event ("History Event ·
// 9 August 2020") or a dated Lore Entry's date. Read from the short link
// alone, the chip is the part and there is no date.
export function bandLabel(
  link: Pick<CodexEntryLink, "part">,
  entry: Pick<CodexEntry, "kind" | "occurred_on" | "date_precision"> | null,
): { chip: string; meta: string | null } {
  const date = entry ? occurredLabel(entry.occurred_on, entry.date_precision) : null;
  if (link.part === "history_event") {
    return { chip: entry ? kindName(entry.kind) : PART_NAME.history_event.one, meta: entry ? [PART_NAME.history_event.one, date].filter(Boolean).join(" · ") : null };
  }
  return { chip: PART_NAME[link.part].one, meta: link.part === "lore_entry" ? date : null };
}
