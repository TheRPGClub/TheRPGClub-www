import { fetchCodexEntry, fetchCodexPage, fetchRecentEntries, type CodexPage } from "@/lib/api/codex";
import type { CodexEntry, CodexEntryLink, CodexPart } from "@/lib/codex/types";

// What the Club Codex contents page shows (design 1C, www#124): a Fun Fact
// leading, a door per part with its count and its newest entry, and the
// newest entries across all three parts.
//
// The API has no read for today's Daily Fun Fact, so the page leads with a
// Fun Fact picked at random instead (API follow-up in notes/decisions.md).

export interface CodexDoor {
  count: number;
  // Club History's latest History Event by date; the newest entry otherwise.
  entry: CodexEntry | null;
}

export interface LatelyItem {
  link: CodexEntryLink;
  // From the entry's full read; null when that read failed.
  author: string | null;
  createdAt: string | null;
}

export interface CodexContents {
  fact: CodexEntry | null;
  doors: Record<CodexPart, CodexDoor>;
  // Null when the read failed.
  lately: LatelyItem[] | null;
}

const LATELY = 6;

type Read<T> = T | "not_found" | null;
const isFound = <T>(r: Read<T>): r is T | null => r !== "not_found";

// Null-safe page: a failed read shows as an empty part, never as the page
// failing; "not_found" anywhere means the Flag now hides the Feature.
function pageOf(r: Read<CodexPage<CodexEntry>>): CodexPage<CodexEntry> {
  return r && r !== "not_found" ? r : { data: [], total: 0, pages: 1 };
}

export async function readCodexContents(random: () => number = Math.random): Promise<CodexContents | "not_found"> {
  const [factsRead, loreRead, historyRead, recentRead] = await Promise.all([
    fetchCodexPage("fun_fact", 1, LATELY),
    fetchCodexPage("lore_entry", 1, LATELY),
    fetchCodexPage("history_event", 1, 1),
    fetchRecentEntries(LATELY),
  ]);
  if (![factsRead, loreRead, historyRead, recentRead].every(isFound)) return "not_found";
  const facts = pageOf(factsRead);
  const lore = pageOf(loreRead);
  const history = pageOf(historyRead);
  const recent = recentRead && recentRead !== "not_found" ? recentRead.data : null;

  const known = new Map<number, CodexEntry>([...facts.data, ...lore.data].map((e) => [e.id, e]));
  const historyIds = (recent ?? []).filter((l) => l.part === "history_event").map((l) => l.id);
  const factPage = facts.total > 0 ? 1 + Math.floor(random() * facts.total) : 0;

  const [factRead, latestRead, ...historyReads] = await Promise.all([
    factPage > 0 ? fetchCodexPage("fun_fact", factPage, 1) : Promise.resolve(null),
    history.total > 1 ? fetchCodexPage("history_event", history.total, 1) : Promise.resolve(historyRead),
    ...historyIds.map((id) => fetchCodexEntry("history_event", id)),
  ]);
  for (const r of historyReads) if (r && r !== "not_found") known.set(r.id, r);

  return {
    fact: factRead && factRead !== "not_found" ? (factRead.data[0] ?? facts.data[0] ?? null) : (facts.data[0] ?? null),
    doors: {
      history_event: { count: history.total, entry: pageOf(latestRead).data[0] ?? null },
      lore_entry: { count: lore.total, entry: lore.data[0] ?? null },
      fun_fact: { count: facts.total, entry: facts.data[0] ?? null },
    },
    lately: recent?.map((link) => {
      const entry = known.get(link.id);
      return { link, author: entry?.author.name ?? null, createdAt: entry?.created_at ?? null };
    }) ?? null,
  };
}
