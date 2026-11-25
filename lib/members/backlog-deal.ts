import { apiFetch } from "@/lib/api";
import type {
  BacklogPick,
  BacklogPickMeta,
  BacklogPickResponse,
  Platform,
} from "@/lib/api/types";
import {
  backlogPickQuery,
  pickSourceLabel,
  type BacklogPickParams,
} from "@/lib/api/backlog-pick";
import { fetchPlatforms } from "@/lib/api/shared";

// The backlog picker deals a hand of three. The API draws one game per call
// from a seeded shuffle walked by `position`, so the hand is the same seed
// read three times in a row (each call starting at the last one's
// `next_position`). The shuffle covers each candidate once, so the three are
// distinct; a repeat (the walk wrapped round a small pool) ends the hand
// early, which is how a pool of one or two deals one or two cards. The whole
// hand stays in the URL (seed + position), so it can be reloaded or shared,
// and "Deal again" carries on from where the hand ended.

export const HAND = 3;

export type Deal =
  | { kind: "ok"; picks: BacklogPick[]; meta: BacklogPickMeta; next: number; wrapped: boolean }
  | { kind: "empty"; meta: BacklogPickMeta }
  | { kind: "error"; message: string };

export async function dealHand(userId: string, filters: BacklogPickParams): Promise<Deal> {
  const picks: BacklogPick[] = [];
  let seed = filters.seed;
  let position = filters.position;
  let first: BacklogPickMeta | null = null;
  let next = position;
  let wrapped = false;

  for (let i = 0; i < HAND; i++) {
    const res = await apiFetch(
      `/api/v1/users/${userId}/backlog/pick${backlogPickQuery({ ...filters, seed, position })}`,
      { cache: "no-store" },
    );
    if (!res.ok) {
      if (i === 0) {
        return {
          kind: "error",
          message: `Couldn't pick a game right now (HTTP ${res.status}).`,
        };
      }
      break; // Keep the cards already dealt.
    }
    const body: BacklogPickResponse = await res.json();
    first ??= body.meta;
    seed = body.meta.seed;
    if (!body.data) break;
    if (picks.some((p) => p.gamedb_game_id === body.data!.gamedb_game_id)) break;
    picks.push(body.data);
    wrapped ||= body.meta.wrapped;
    next = body.meta.next_position ?? 0;
    position = next;
  }

  if (!first) return { kind: "error", message: "Couldn't pick a game right now." };
  // Later calls carry the server-drawn seed; the first meta lacks nothing
  // else the page needs.
  const meta = { ...first, seed: seed ?? first.seed };
  if (picks.length === 0) return { kind: "empty", meta };
  return { kind: "ok", picks, meta, next, wrapped };
}

// The platform names for picks that carry no platform of their own.
export async function loadPickPlatforms(): Promise<Platform[]> {
  return (await fetchPlatforms()) ?? [];
}

// Why an empty hand is empty: the hours limit, the platform, or nothing left.
export function pickEmptyMessage(filters: BacklogPickParams, total: number): string {
  const where = pickSourceLabel(filters.source).toLowerCase();
  if (filters.maxHours !== null && total > 0) {
    return `Nothing in your ${where} has a HowLongToBeat time of ${filters.maxHours} hour${filters.maxHours === 1 ? "" : "s"} or less. Games with no time on file are skipped when you set a limit.`;
  }
  if (filters.platformId !== null) {
    return `Nothing in your ${where} on that platform that isn't already on Now Playing.`;
  }
  return `Nothing in your ${where} to pick from. Games already on Now Playing are left out.`;
}
