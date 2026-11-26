import { apiFetch } from "@/lib/api";

// Moves a member's News Mark (api#495, `PUT /users/:id/news_mark`): to an
// instant (the newest News Item the page showed) or to now (Mark all seen).
// The API only moves it forward. Answers the API's status, or null when it
// couldn't be reached. The feed's meta carries the mark, so the caller
// expires the member's cached feed (newsFeedTag) after a move.
export async function putNewsMark(
  userId: string,
  change: { news_mark: string } | { all_seen: true },
): Promise<number | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/news_mark`, {
      method: "PUT",
      body: JSON.stringify({ data: change }),
      cache: "no-store",
    });
    return res.status;
  } catch {
    return null;
  }
}
