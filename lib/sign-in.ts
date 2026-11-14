import { RETURN_TO_PARAM, safeReturnTo } from "@/lib/return-to";

// Discord sign-in runs on the API: the website sends the Visitor to its start
// with the return-to, and the API hands the session token back to
// /auth/callback (or /join, for a Visitor outside the club's server).

// The session token, set by /auth/callback and read by the proxy and the
// protected layout.
export const SESSION_COOKIE = "rpgclub_token";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// Marks a Visitor who pressed Continue on /join: if the API sends them back
// there, the page knows it is a second try. A successful sign-in clears it.
export const JOIN_RETRY_COOKIE = "rpgclub_join_retry";
export const JOIN_RETRY_MAX_AGE_SECONDS = 60 * 10;

export const AUTH_FAILED_PATH = "/?error=auth_failed";
export const DEFAULT_DESTINATION = "/dashboard";

// The API's sign-in start, carrying the return-to when it is a same-origin path.
export function discordSignInUrl(returnTo?: string | null): string {
  const api = process.env.API_URL ?? "http://localhost:3000";
  return withReturnTo(`${api}/auth/discord`, returnTo);
}

function withReturnTo(path: string, returnTo: string | null | undefined, query = {}) {
  const kept = safeReturnTo(returnTo);
  const params = new URLSearchParams(kept ? { ...query, [RETURN_TO_PARAM]: kept } : query);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

// Where the front page forwards a token the API handed it (until the cutover,
// www#84, points the API at /auth/callback directly).
export function callbackPath(token: string, returnTo?: string | null): string {
  return withReturnTo("/auth/callback", returnTo, { token });
}

// The join page's Continue, keeping the return-to.
export function joinContinuePath(returnTo?: string | null): string {
  return withReturnTo("/join/continue", returnTo);
}
