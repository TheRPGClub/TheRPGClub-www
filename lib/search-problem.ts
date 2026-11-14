// What a search inside a page (the game, member and thread pickers) shows
// when its endpoint does not answer: a lapsed session (the website's /api
// route passes the API's 401 through, and the proxy answers 401 without a
// session cookie) is a sign-in problem with a way to sign in again, not a
// broken search. `status` is null when the request never answered.
// Client-safe.

export type SearchProblem = { message: string; signIn: boolean };

const FAILED: SearchProblem = { message: "Search failed. Try again.", signIn: false };

export function searchProblem(
  status: number | null,
  { forbidden }: { forbidden?: string } = {},
): SearchProblem {
  if (status === 401) return { message: "Your session has ended.", signIn: true };
  if (status === 403 && forbidden) return { message: forbidden, signIn: false };
  return FAILED;
}
