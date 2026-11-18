import type { CodexEntryLink, CodexPart } from "@/lib/codex/types";

// Where the Club Codex lives on the site (www#124): /codex is its contents
// page, and each part has a page of its own. Club History and Club Lore come
// with www#126 and www#125; the contents page links to them already.
export const CODEX_PATH = "/codex";
export const HISTORY_PATH = `${CODEX_PATH}/history`;
export const LORE_PATH = `${CODEX_PATH}/lore`;
export const FUN_FACTS_PATH = `${CODEX_PATH}/fun-facts`;
// The Fun Fact add panel at the top of the wall, as a link target.
export const ADD_FUN_FACT_ID = "add-fun-fact";
// Writing a Lore Entry (www#125's form) and a History Event (www#126's).
export const NEW_LORE_PATH = `${LORE_PATH}/new`;
export const NEW_HISTORY_PATH = `${HISTORY_PATH}/new`;

// A History Event's desk (www#126), for Admins and above.
export function editHistoryPath(id: number): string {
  return `${HISTORY_PATH}/${id}/edit`;
}

// Each part as the copy names it, one entry and many.
export const PART_NAME: Record<CodexPart, { one: string; many: string; section: string }> = {
  history_event: { one: "History Event", many: "History Events", section: "Club History" },
  lore_entry: { one: "Lore Entry", many: "Lore Entries", section: "Club Lore" },
  fun_fact: { one: "Fun Fact", many: "Fun Facts", section: "Fun Facts" },
};

// "1 Fun Fact", "42 Fun Facts".
export function partCount(part: CodexPart, n: number): string {
  return `${n} ${n === 1 ? PART_NAME[part].one : PART_NAME[part].many}`;
}

// A Fun Fact's place on the wall: its card's anchor.
export function funFactAnchor(id: number): string {
  return `fun-fact-${id}`;
}

// Where an entry reads. A Fun Fact opens the wall at its card (the newest
// are on the first page, which is where the contents page points).
export function entryHref(entry: Pick<CodexEntryLink, "id" | "part">): string {
  if (entry.part === "lore_entry") return `${LORE_PATH}/${entry.id}`;
  if (entry.part === "history_event") return `${HISTORY_PATH}#history-event-${entry.id}`;
  return `${FUN_FACTS_PATH}#${funFactAnchor(entry.id)}`;
}

// The Lore Entry a Fun Fact tells the story of: its first Club Lore "See
// also", for the "Read the story" link.
export function storyOf(links: readonly CodexEntryLink[]): CodexEntryLink | null {
  return links.find((link) => link.part === "lore_entry") ?? null;
}
