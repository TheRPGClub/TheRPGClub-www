import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type { ApiCollection, Suggestion, SuggestionStatus } from "@/lib/api/types";

// Server-only reads for the Suggestion Board and the Superadmin review page
// (they read the session cookie).

// The API's page size cap.
const MAX_PER = 500;

export interface SuggestionList {
  rows: Suggestion[];
  total: number;
}

// Suggestions in the given statuses, most upvoted first, then newest. `per`
// 1 is enough for a tab's count. Null when the list can't be read.
export async function fetchSuggestions(
  statuses: readonly SuggestionStatus[],
  per: number = MAX_PER,
): Promise<SuggestionList | null> {
  const qs = new URLSearchParams({
    status: statuses.join(","),
    per: String(Math.min(Math.max(per, 1), MAX_PER)),
  });
  try {
    const res = await apiFetch(`/api/v1/suggestions?${qs}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<Suggestion>;
    return { rows: body.data, total: paginationOf(body.meta, body.data.length).total };
  } catch {
    return null;
  }
}

// Display names for Discord ids (e.g. the reviewing Superadmins), read once
// each. An id that can't be read is left out.
export async function fetchMemberNames(
  ids: readonly (string | null | undefined)[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => !!id))];
  const pairs = await Promise.all(
    unique.map(async (id): Promise<[string, string] | null> => {
      try {
        const res = await apiFetch(`/api/v1/users/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        if (!res.ok) return null;
        const body = (await res.json()) as {
          data?: { global_name?: string | null; username?: string | null };
        };
        const name = body.data?.global_name ?? body.data?.username;
        return name ? [id, name] : null;
      } catch {
        return null;
      }
    }),
  );
  return new Map(pairs.filter((p): p is [string, string] => p !== null));
}
