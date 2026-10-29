import type { PublicWinner, PublicWinnersMeta } from "./types";

// The recent winners for the logged-out landing (GET /api/v1/public/winners).
// The endpoint needs no session, so this is a plain fetch without the cookie
// token: the Data Cache entry is the same for every visitor. The API caches
// the payload for 10 minutes; the page revalidates on the same clock.

const API_URL = process.env.API_URL ?? "http://localhost:3000";
export const PUBLIC_WINNERS_REVALIDATE_SECONDS = 600;

// An empty list when the API is down or the read fails: the landing then
// falls back to describing the club without winners.
export async function fetchPublicWinners(): Promise<PublicWinner[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/public/winners`, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: PUBLIC_WINNERS_REVALIDATE_SECONDS,
        tags: ["gotm"],
      },
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
