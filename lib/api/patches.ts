import { apiFetch } from "@/lib/api";
import type { Patch, PatchWithNeighbours } from "@/lib/patch-notes/types";

// The Patch Notes reads (spec api#510): public, so a Visitor's read carries
// no session. The API serves them only while the Feature is open to the
// caller (Live for Visitors and members; Preview too for staff), and 404s
// otherwise: that comes back as "not_found", any other failure as null.
// Never cached: a Patch published or edited shows on the next load.

const FETCH: RequestInit = { cache: "no-store" };

// Every published Patch, newest first. The club writes a few a month, so
// one page of 500 holds years of them.
export const PATCHES_PATH = "/api/v1/patches?per=500";

type Read<T> = T | "not_found" | null;

async function read<T>(path: string): Promise<Read<T>> {
  try {
    const res = await apiFetch(path, FETCH);
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPatches(): Promise<Read<Patch[]>> {
  const data = await read<Patch[]>(PATCHES_PATH);
  if (data === null || data === "not_found") return data;
  return Array.isArray(data) ? data.filter((p) => p.status === "published") : [];
}

export async function fetchPatch(number: number): Promise<Read<PatchWithNeighbours>> {
  const patch = await read<PatchWithNeighbours>(`/api/v1/patches/${number}`);
  // A staff read finds drafts too; the public page shows published Patches only.
  if (patch && patch !== "not_found" && patch.status !== "published") return "not_found";
  return patch;
}
