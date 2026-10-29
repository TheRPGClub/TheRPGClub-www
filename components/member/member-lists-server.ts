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
