import { apiFetch } from "@/lib/api";

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
