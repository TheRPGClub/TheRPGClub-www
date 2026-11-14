import { apiFetch } from "@/lib/api";
import type { ApiCollection, ApiSingle, User } from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";

// The reads every member page shares: the member, and one page of one of
// their lists.

// The page number from `?page=`, page one for anything that isn't one.
export function pageNumber(raw: string | undefined): number {
  return Math.max(1, parseInt(raw ?? "1", 10) || 1);
}

// The member, or null when the API can't find them (the page is a 404).
export async function fetchMember<T extends User = User>(id: string): Promise<T | null> {
  const res = await apiFetch(`/api/v1/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return ((await res.json()) as ApiSingle<T>).data;
}

export interface MemberListRead<T> {
  // False when the read failed: the page then shows an empty list.
  ok: boolean;
  entries: T[];
  total: number;
  totalPages: number;
  // The page size the server used, when it said.
  per: number | null;
}

// One page of a list. The server owns the split: the page size asked for is
// only a request.
export async function fetchMemberList<T>(path: string): Promise<MemberListRead<T>> {
  const res = await apiFetch(path, { cache: "no-store" });
  if (!res.ok) return { ok: false, entries: [], total: 0, totalPages: 1, per: null };
  const body: ApiCollection<T> = await res.json();
  const { total, totalPages } = paginationOf(body.meta, body.data.length);
  const served = (body.meta as { per?: unknown } | undefined)?.per;
  return {
    ok: true,
    entries: body.data,
    total,
    totalPages,
    per: typeof served === "number" && served > 0 ? served : null,
  };
}

// The member and a page of their list (`favorites`, `backlog`,
// `now_playing`), or null when the member can't be read.
export async function loadMemberList<T>(
  id: string,
  list: string,
  per: number,
  page: number,
) {
  const [user, read] = await Promise.all([
    fetchMember(id),
    fetchMemberList<T>(`/api/v1/users/${id}/${list}?per=${per}&page=${page}`),
  ]);
  return user ? { user, list: read } : null;
}
