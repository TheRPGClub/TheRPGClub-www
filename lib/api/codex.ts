import { apiFetch } from "@/lib/api";
import type { CollectionMeta } from "./types";
import type { CodexEntry, CodexEntryLink, CodexPart } from "@/lib/codex/types";

// The Club Codex reads (spec api#397, `/api/v1/codex`). Every part belongs to
// the Club Codex Feature, so a read 404s for a member the Flag hides it from:
// that comes back as "not_found", and any other failure as null.
//
// Entries carry `viewer` and the member's own rights, so reads are never
// shared between members (the Data Cache key holds the Authorization) and
// never cached for long: a Fun Fact added or edited shows on the next load.

const FETCH: RequestInit = { cache: "no-store" };

export interface CodexPage<T> {
  data: T[];
  total: number;
  pages: number;
}

type Read<T> = T | "not_found" | null;

async function read<T>(path: string): Promise<Read<{ data: T; meta?: Partial<CollectionMeta> }>> {
  try {
    const res = await apiFetch(path, FETCH);
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    return (await res.json()) as { data: T; meta?: Partial<CollectionMeta> };
  } catch {
    return null;
  }
}

async function readPage<T>(path: string, params: Record<string, string | number>): Promise<Read<CodexPage<T>>> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const body = await read<T[]>(`${path}?${qs}`);
  if (body === null || body === "not_found") return body;
  const data = Array.isArray(body.data) ? body.data : [];
  const total = typeof body.meta?.count === "number" ? body.meta.count : data.length;
  const pages = typeof body.meta?.pages === "number" && body.meta.pages > 0 ? body.meta.pages : 1;
  return { data, total, pages };
}

const PART_PATH: Record<CodexPart, string> = {
  fun_fact: "/api/v1/codex/fun_facts",
  lore_entry: "/api/v1/codex/lore_entries",
  history_event: "/api/v1/codex/history_events",
};

// A page of one part's entries: Fun Facts and Lore Entries newest first,
// History Events in date order.
export function fetchCodexPage(part: CodexPart, page: number, per: number): Promise<Read<CodexPage<CodexEntry>>> {
  return readPage<CodexEntry>(PART_PATH[part], { page, per });
}

export async function fetchCodexEntry(part: CodexPart, id: number): Promise<Read<CodexEntry>> {
  const body = await read<CodexEntry>(`${PART_PATH[part]}/${id}`);
  return body === null || body === "not_found" ? body : body.data;
}

// The newest entries across the three parts, in the short link shape.
export function fetchRecentEntries(per: number): Promise<Read<CodexPage<CodexEntryLink>>> {
  return readPage<CodexEntryLink>("/api/v1/codex/entries", { page: 1, per });
}
