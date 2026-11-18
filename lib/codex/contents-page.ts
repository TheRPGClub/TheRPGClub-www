import { fetchCodexEntry, fetchCodexPage, fetchRecentEntries, fetchTodayFunFact, type CodexPage } from "@/lib/api/codex";
import { funFactPlain } from "@/lib/codex/fun-fact-text";
import type { CodexEntry, CodexEntryLink, CodexPart } from "@/lib/codex/types";

// What the Club Codex contents page shows (design 1C, www#124): the Daily
// Fun Fact leading, a door per part with its count and its newest entry, and
// the newest entries across all three parts.
//
// The Daily Fun Fact is the one the bot last posted (`GET /codex/fun_facts/
// today`, a pure read: it never draws, so the bot's queue never moves). With
// none posted yet, or that read failing, the page leads with the newest Fun
// Fact instead. "Another one" steps through the newest few already read.

export interface CodexDoor {
  count: number;
  // Club History's latest History Event by date; the newest entry otherwise.
  entry: CodexEntry | null;
}

export interface LatelyItem {
  // A Fun Fact's title is its opening words, members named as they are now.
  link: CodexEntryLink;
  // From the entry's full read; null when that read failed.
  author: string | null;
  createdAt: string | null;
}

export interface CodexContents {
  // The Daily Fun Fact last posted and the club day it was posted for;
  // null when none has been (or it couldn't be read).
  daily: { fact: CodexEntry; clubDate: string } | null;
  // The newest Fun Facts, newest first, for the lead panel.
  facts: CodexEntry[];
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

export async function readCodexContents(): Promise<CodexContents | "not_found"> {
  const [todayRead, factsRead, loreRead, historyRead, recentRead] = await Promise.all([
    fetchTodayFunFact(),
    fetchCodexPage("fun_fact", 1, LATELY),
    fetchCodexPage("lore_entry", 1, LATELY),
    fetchCodexPage("history_event", 1, 1),
    fetchRecentEntries(LATELY),
  ]);
  if (todayRead === "not_found" || ![factsRead, loreRead, historyRead, recentRead].every(isFound)) return "not_found";
  const daily = todayRead?.funFact && todayRead.clubDate ? { fact: todayRead.funFact, clubDate: todayRead.clubDate } : null;
  const facts = pageOf(factsRead);
  const lore = pageOf(loreRead);
  const history = pageOf(historyRead);
  const recent = recentRead && recentRead !== "not_found" ? recentRead.data : null;

  const known = new Map<number, CodexEntry>([...facts.data, ...lore.data].map((e) => [e.id, e]));
  const historyIds = (recent ?? []).filter((l) => l.part === "history_event").map((l) => l.id);

  // The latest History Event by date is the last of the date-ordered list.
  const [latestRead, ...historyReads] = await Promise.all([
    history.total > 1 ? fetchCodexPage("history_event", history.total, 1) : Promise.resolve(historyRead),
    ...historyIds.map((id) => fetchCodexEntry("history_event", id)),
  ]);
  for (const r of historyReads) if (r && r !== "not_found") known.set(r.id, r);

  return {
    daily,
    facts: facts.data,
    doors: {
      history_event: { count: history.total, entry: pageOf(latestRead).data[0] ?? null },
      lore_entry: { count: lore.total, entry: lore.data[0] ?? null },
      fun_fact: { count: facts.total, entry: facts.data[0] ?? null },
    },
    lately: recent?.map((link) => {
      const entry = known.get(link.id);
      const title = entry?.part === "fun_fact" && entry.body ? openingWords(funFactPlain(entry.body, entry.mentions, "")) : link.title;
      return { link: { ...link, title }, author: entry?.author.name ?? null, createdAt: entry?.created_at ?? null };
    }) ?? null,
  };
}

// A Fun Fact's first words for a one-line title: the list cuts it with an
// ellipsis, so this only keeps the line short.
function openingWords(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 120 ? `${flat.slice(0, 119)}…` : flat;
}
