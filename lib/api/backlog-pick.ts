import { firstParam } from "@/lib/search-params";
import type { BacklogPickSource } from "./types";

// The pick page is driven entirely by its URL, so a reroll is just a link and
// any pick can be shared or reloaded. These helpers own that URL: they read the
// raw search params into clean filters (dropping anything the API would
// reject with 422 `invalid_*`) and write them back out, for both the API query and the page's links.

export const PICK_SOURCES: ReadonlyArray<{ value: BacklogPickSource; label: string }> = [
  { value: "backlog", label: "Backlog" },
  { value: "collection", label: "Collection" },
  { value: "both", label: "Backlog and collection" },
];

const MAX_SEED = 0xffffffff;

export interface BacklogPickParams {
  source: BacklogPickSource;
  platformId: number | null;
  maxHours: number | null;
  // Null means "let the server draw one"; it comes back in meta.seed.
  seed: number | null;
  position: number;
}

export type BacklogPickSearchParams = Partial<
  Record<"source" | "platform_id" | "max_hours" | "seed" | "position", string | string[]>
>;

// An integer in [min, max], or null for anything else (blank, junk, decimals).
function intIn(value: string | undefined, min: number, max: number): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const n = Number(value.trim());
  return Number.isSafeInteger(n) && n >= min && n <= max ? n : null;
}

export function parseBacklogPickParams(raw: BacklogPickSearchParams): BacklogPickParams {
  const source = firstParam(raw.source);
  return {
    source: PICK_SOURCES.some((s) => s.value === source)
      ? (source as BacklogPickSource)
      : "backlog",
    platformId: intIn(firstParam(raw.platform_id), 1, Number.MAX_SAFE_INTEGER),
    maxHours: intIn(firstParam(raw.max_hours), 1, 1000),
    seed: intIn(firstParam(raw.seed), 0, MAX_SEED),
    position: intIn(firstParam(raw.position), 0, Number.MAX_SAFE_INTEGER) ?? 0,
  };
}

// Defaults are left out so the URLs stay short.
export function backlogPickQuery(params: BacklogPickParams): string {
  const query = new URLSearchParams();
  if (params.source !== "backlog") query.set("source", params.source);
  if (params.platformId !== null) query.set("platform_id", String(params.platformId));
  if (params.maxHours !== null) query.set("max_hours", String(params.maxHours));
  if (params.seed !== null) query.set("seed", String(params.seed));
  if (params.position > 0) query.set("position", String(params.position));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function backlogPickHref(userId: string, params: BacklogPickParams): string {
  return `/members/${userId}/backlogged-games/pick${backlogPickQuery(params)}`;
}

export function pickSourceLabel(source: BacklogPickSource): string {
  return PICK_SOURCES.find((s) => s.value === source)?.label ?? "Backlog";
}
