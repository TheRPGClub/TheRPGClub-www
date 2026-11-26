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
// The link-preview crawlers wait a few seconds at most for the image; the
// site metadata, read on every page, waits far less, so a sleeping API never
// holds up a page for long.
export const SHARE_CARD_IMAGE_TIMEOUT_MS = 4_000;
export const SHARE_CARD_METADATA_TIMEOUT_MS = 1_500;
// After a failed Share Card read, how long the last good answer stands in
// without asking the API again.
export const SHARE_CARD_RETRY_AFTER_MS = 30_000;

// The winners, or null when the read failed (the API down or erroring, a
// timeout). A 4xx (the Feature not Live) is an answer: no winners.
async function readPublicWinners(
  init: { revalidate: number; headers?: Record<string, string>; signal?: AbortSignal },
): Promise<PublicWinner[] | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/winners`, {
      headers: { Accept: "application/json", ...init.headers },
      signal: init.signal,
      next: { revalidate: init.revalidate, tags: ["gotm"] },
    });
    if (res.status >= 500) return null;
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: PublicWinner[];
      meta?: PublicWinnersMeta;
    };
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return null;
  }
}

// An empty list when the API is down or the read fails: the landing then
// falls back to describing the club without winners.
export async function fetchPublicWinners(): Promise<PublicWinner[]> {
  return (await readPublicWinners({ revalidate: PUBLIC_WINNERS_REVALIDATE_SECONDS })) ?? [];
}

// This server instance's last good Share Card read, and when a read last
// failed. Failed reads leave nothing in the Data Cache, so without this each
// page would wait out the timeout again while the API sleeps.
let lastGood: PublicWinner[] = [];
let failedAt: number | null = null;

// The Share Card's read (site metadata and the card image). When the API is
// down or asleep past the timeout it is the last good answer (empty, so the
// brand-only card, if there was none), and for SHARE_CARD_RETRY_AFTER_MS
// after a failure that answer is used without asking the API.
export async function fetchShareCardWinners(
  timeoutMs: number = SHARE_CARD_IMAGE_TIMEOUT_MS,
): Promise<PublicWinner[]> {
  if (failedAt !== null && Date.now() - failedAt < SHARE_CARD_RETRY_AFTER_MS) return lastGood;
  const winners = await readPublicWinners({
    revalidate: SHARE_CARD_REVALIDATE_SECONDS,
    headers: { "X-RPGClub-Read": "share-card" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (winners === null) {
    failedAt = Date.now();
    return lastGood;
  }
  failedAt = null;
  lastGood = winners;
  return winners;
}
