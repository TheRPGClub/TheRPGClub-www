"use server";

import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle, GameRelations, Thread } from "@/lib/api/types";
import { alternateVersion, type AlternateVersion, type GameThreadRef } from "@/lib/games/game-edit";

// The Game Edit page's read-backs after Save all (spec api#437): the
// sections whose saved record only the API knows (a linked thread's jump
// link, a linked version's year and cover). Each answers null when the read
// fails, so the page can say so instead of showing a guess.

const validId = (id: number) => Number.isInteger(id) && id > 0;

async function read<T>(path: string): Promise<T | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loadGameThreadsAction(gameId: number): Promise<GameThreadRef[] | null> {
  if (!validId(gameId)) return null;
  const body = await read<ApiCollection<Thread>>(`/api/v1/games/${gameId}/threads?per=50`);
  return body?.data.map(({ thread_id, thread_name, jump_url }) => ({ thread_id, thread_name, jump_url })) ?? null;
}

export async function loadVersionsAction(gameId: number): Promise<AlternateVersion[] | null> {
  if (!validId(gameId)) return null;
  const body = await read<ApiSingle<GameRelations>>(`/api/v1/games/${gameId}/relations`);
  return body ? (body.data.alternates ?? []).map(alternateVersion) : null;
}
