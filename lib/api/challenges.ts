import { apiFetch } from "@/lib/api";
import { paginationOf } from "@/lib/api/pagination";
import type { ApiCollection, ApiSingle } from "@/lib/api/types";
import type { PoolDefinition } from "@/lib/challenges/form";
import type { Challenge, ChallengeOpenSignup, ChallengeRun, PoolGame, PoolProgressGame } from "@/lib/challenges/types";

// Server-only reads for the Challenges pages (they read the session cookie).
// Each answers null when the API can't be read, so a page can say so rather
// than fail.

const MAX_PER = 500;

async function readJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store", ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Every Challenge the viewer may see (hidden ones only for staff and their
// Host), newest first.
export async function fetchChallenges(): Promise<Challenge[] | null> {
  const body = await readJson<ApiCollection<Challenge>>(`/api/v1/challenges?per=${MAX_PER}`);
  return body?.data ?? null;
}

export type ChallengeRead = { ok: true; data: Challenge } | { ok: false; status: number };

// One Challenge with its `run_count` and the Pool's `game_count`. A 404 is
// one that doesn't exist or is hidden from the viewer.
export async function fetchChallenge(id: number): Promise<ChallengeRead> {
  try {
    const res = await apiFetch(`/api/v1/challenges/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, status: res.status };
    const body = (await res.json()) as ApiSingle<Challenge>;
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, status: 0 };
  }
}

// A Challenge's Runs, newest first, with progress.
export async function fetchChallengeRuns(id: number): Promise<ChallengeRun[] | null> {
  const body = await readJson<ApiCollection<ChallengeRun>>(`/api/v1/challenges/${id}/runs?per=${MAX_PER}`);
  return body?.data ?? null;
}

// How many of a Challenge's Runs are Finished (one row read, its count kept).
export async function fetchFinishedCount(id: number): Promise<number | null> {
  const body = await readJson<ApiCollection<ChallengeRun>>(`/api/v1/challenges/${id}/runs?status=finished&per=1`);
  return body ? paginationOf(body.meta, body.data.length).total : null;
}

// A member's Runs with their Secret Santa sign-ups still waiting for a draw
// (`meta.signups`; empty from an API without it).
export async function fetchMemberRunSheet(
  userId: string,
): Promise<{ runs: ChallengeRun[]; signups: ChallengeOpenSignup[] } | null> {
  const body = await readJson<ApiCollection<ChallengeRun> & { meta?: { signups?: ChallengeOpenSignup[] } }>(
    `/api/v1/users/${encodeURIComponent(userId)}/challenge_runs?per=${MAX_PER}`,
  );
  return body ? { runs: body.data, signups: body.meta?.signups ?? [] } : null;
}

export interface PoolPreview {
  games: PoolGame[];
  total: number;
}

// The games a Pool definition resolves to now, oldest release first.
export async function fetchPoolPreview(definition: PoolDefinition, per: number = MAX_PER): Promise<PoolPreview | null> {
  const body = await readJson<ApiCollection<PoolGame>>(`/api/v1/challenges/pool_preview?per=${per}`, {
    method: "POST",
    body: JSON.stringify({ data: definition }),
  });
  return body
    ? {
        games: body.data,
        total: paginationOf(body.meta, body.data.length).total,
      }
    : null;
}

// A Pool Challenge's games with who Cleared each and who has it In
// Progress (the Pool view), oldest release first, up to 500.
export async function fetchPoolProgress(id: number): Promise<PoolProgressGame[] | null> {
  const body = await readJson<ApiCollection<PoolProgressGame>>(`/api/v1/challenges/${id}/pool_progress?per=${MAX_PER}`);
  return body?.data ?? null;
}

// A saved Challenge's Pool as a definition the preview takes (its linked
// Game List aside, which the preview can't resolve).
export function savedPoolDefinition(challenge: Challenge): PoolDefinition | null {
  const pool = challenge.pool;
  if (challenge.challenge_format !== "pool" || !pool) return null;
  return {
    franchise_ids: (pool.franchises ?? []).map((f) => f.franchise_id),
    collection_ids: (pool.collections ?? []).map((c) => c.collection_id),
    core_game_ids: (pool.core_games ?? []).map((g) => g.game_id),
    optional_game_ids: (pool.optional_games ?? []).filter((g) => g.source === "hand").map((g) => g.game_id),
    excluded_game_ids: (pool.excluded_games ?? []).map((g) => g.game_id),
  };
}
