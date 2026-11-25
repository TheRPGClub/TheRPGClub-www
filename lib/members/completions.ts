import { apiFetch } from "@/lib/api";
import type { ApiCollection, GameCompletion } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";

// Every one of a member's completions, walked page by page at the API's
// largest page size. `capped` is true when the walk stopped at `maxPages`
// before the end, so callers never present a partial set as the whole.
export async function fetchAllCompletions(
  userId: string,
  maxPages = 6,
): Promise<{ entries: GameCompletion[]; capped: boolean } | null> {
  const per = 500;
  const entries: GameCompletion[] = [];
  for (let page = 1; page <= maxPages; page++) {
    let res: Response;
    try {
      res = await apiFetch(
        `/api/v1/users/${userId}/completions?per=${per}&page=${page}`,
        { cache: "no-store" },
      );
    } catch {
      return null;
    }
    if (!res.ok) return null;
    const body: ApiCollection<GameCompletion> = await res.json();
    entries.push(...body.data);
    const { totalPages } = paginationOf(body.meta, body.data.length);
    if (page >= totalPages) return { entries, capped: false };
  }
  return { entries, capped: true };
}

// One month's completion tally: `month` is `YYYY-MM` (UTC, like the API's
// `year` filter), or null for the undated ones.
export type CompletionMonth = { month: string | null; count: number };

// A member's completions tallied by month, newest first, undated last; one
// grouped read however many completions there are. Null when it fails.
export async function fetchCompletionMonths(
  userId: string,
): Promise<CompletionMonth[] | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/completions/months`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: { data: CompletionMonth[] } = await res.json();
    return body.data;
  } catch {
    return null;
  }
}
