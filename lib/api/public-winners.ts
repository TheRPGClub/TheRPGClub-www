import type { PublicWinner, PublicWinnersMeta } from "./types";

// The recent winners (GET /api/v1/public/winners). The endpoint needs no
// session, so this is a plain fetch without the cookie token: the Data Cache
// entry is the same for every visitor. Both reads carry the `gotm` tag, which
// the API's POST to /api/revalidate refreshes when a round is decided.
//
// Two reads of the same endpoint, kept apart in the Data Cache by a header
// (Next keys a fetch on its URL and headers, and judges staleness by the
// caller's own revalidate, so a shared entry would refresh on the faster
// clock for both):
// - the landing's, on the API's own 10-minute clock;
// - the Share Card's (site metadata and the card image), on a daily backstop
//   only. The card follows the API's revalidate POST, so it keeps the
//   previous round's covers until a whole round is decided (spec api#518),
//   where a 10-minute clock would show a half-decided round.

const API_URL = process.env.API_URL ?? "http://localhost:3000";
export const PUBLIC_WINNERS_REVALIDATE_SECONDS = 600;
export const SHARE_CARD_REVALIDATE_SECONDS = 86_400;
// The link-preview crawlers wait a few seconds at most; a sleeping API must
// not hold up every page's metadata.
const SHARE_CARD_TIMEOUT_MS = 4_000;

async function readPublicWinners(
  init: { revalidate: number; headers?: Record<string, string>; signal?: AbortSignal },
): Promise<PublicWinner[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/winners`, {
      headers: { Accept: "application/json", ...init.headers },
      signal: init.signal,
      next: { revalidate: init.revalidate, tags: ["gotm"] },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: PublicWinner[];
      meta?: PublicWinnersMeta;
    };
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}

// An empty list when the API is down or the read fails: the landing then
// falls back to describing the club without winners.
export function fetchPublicWinners(): Promise<PublicWinner[]> {
  return readPublicWinners({ revalidate: PUBLIC_WINNERS_REVALIDATE_SECONDS });
}

// The Share Card's read: empty when the API is down, asleep past the timeout
// or has no winners, and the card falls back to the brand-only version.
export function fetchShareCardWinners(): Promise<PublicWinner[]> {
  return readPublicWinners({
    revalidate: SHARE_CARD_REVALIDATE_SECONDS,
    headers: { "X-RPGClub-Read": "share-card" },
    signal: AbortSignal.timeout(SHARE_CARD_TIMEOUT_MS),
  });
}
