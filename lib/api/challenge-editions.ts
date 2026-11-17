import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type { ApiCollection, ApiSingle } from "@/lib/api/types";
import type { SantaRead } from "@/lib/challenges/santa-pick";
import type { ChallengeEdition, SantaView } from "@/lib/challenges/types";

// Server-only reads for an Assignment Challenge's Edition page (they read the
// session cookie). Each answers null when the API can't be read.

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// A Challenge's Editions, newest first, each with its members (and, from
// the reveal, its assignments).
export async function fetchEditions(challengeId: number): Promise<ChallengeEdition[] | null> {
  const body = await readJson<ApiCollection<ChallengeEdition>>(`/api/v1/challenges/${challengeId}/editions?per=50`);
  return body?.data ?? null;
}

// How many games are in a member's backlog (one row read, its count kept).
export async function fetchBacklogCount(userId: string): Promise<number | null> {
  const body = await readJson<ApiCollection<unknown>>(`/api/v1/users/${encodeURIComponent(userId)}/backlog?per=1`);
  return body ? paginationOf(body.meta, body.data.length).total : null;
}

// The signed-in member's side as a Santa: who they pick for and their pick.
// Null for anyone the draw didn't make a Santa (the API's 403).
export async function fetchSantaView(editionId: number): Promise<SantaView | null> {
  const body = await readJson<ApiSingle<SantaView>>(`/api/v1/challenge_editions/${editionId}/santa`);
  return body?.data ?? null;
}

// The pick page's read of the Santa view (www#111): the whole view with its
// eligible backlog, or the API's refusal (403 `not_a_santa` for anyone the
// draw didn't make this Edition's Santa) with its body, so the page can say
// why.
export async function readSantaView(editionId: number): Promise<SantaRead> {
  try {
    const res = await apiFetch(`/api/v1/challenge_editions/${editionId}/santa`, { cache: "no-store" });
    if (!res.ok) {
      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        // non-JSON error body
      }
      return { ok: false, status: res.status, body };
    }
    return { ok: true, view: ((await res.json()) as ApiSingle<SantaView>).data };
  } catch {
    return { ok: false, status: 0, body: null };
  }
}
