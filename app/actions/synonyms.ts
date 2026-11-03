"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { SearchSynonymGroup } from "@/lib/api/types";
import { getSession } from "@/lib/session";
import { checkSynonymTerms } from "@/lib/synonyms";

export interface SynonymActionResult {
  ok: boolean;
  data?: SearchSynonymGroup;
  error?: string;
}

const PAGE = "/admin/synonyms";
const UNREACHABLE = "Couldn't reach the club's server. Try again.";

async function errorMessage(res: Response): Promise<string> {
  if (res.status === 401) return "Sign in again to change synonyms.";
  if (res.status === 403) return "Only Admins and Superadmins can change synonyms.";
  if (res.status === 404) return "That entry no longer exists. Refresh to see the list.";
  return apiErrorMessage(await readApiError(res));
}

async function call(path: string, init: RequestInit): Promise<Response | null> {
  try {
    return await apiFetch(path, init);
  } catch {
    return null;
  }
}

async function replaceTerms(groupId: number, terms: string[]): Promise<SynonymActionResult> {
  const res = await call(`/api/v1/search_synonym_groups/${groupId}/terms`, {
    method: "PUT",
    body: JSON.stringify({ data: { terms } }),
  });
  if (!res) return { ok: false, error: UNREACHABLE };
  if (!res.ok) return { ok: false, error: await errorMessage(res) };
  const body = (await res.json()) as { data: SearchSynonymGroup };
  return { ok: true, data: body.data };
}

// Saves an entry's terms in one request: the headword first, then the
// others, replacing whatever the group had. With no `groupId` it creates the
// group first; if its terms are then refused, the empty group is deleted so
// no blank entry is left behind.
export async function saveSynonymGroupAction(
  groupId: number | null,
  terms: string[],
): Promise<SynonymActionResult> {
  if (groupId !== null && (!Number.isInteger(groupId) || groupId <= 0)) {
    return { ok: false, error: "That entry no longer exists. Refresh to see the list." };
  }
  const checked = checkSynonymTerms(Array.isArray(terms) ? terms : []);
  if (!checked.ok) return { ok: false, error: checked.error };

  if (groupId !== null) {
    const result = await replaceTerms(groupId, checked.terms);
    if (result.ok) revalidatePath(PAGE);
    return result;
  }

  const session = await getSession();
  const created = await call("/api/v1/search_synonym_groups", {
    method: "POST",
    body: JSON.stringify({ data: { created_by: session?.principal.discord_id ?? null } }),
  });
  if (!created) return { ok: false, error: UNREACHABLE };
  if (!created.ok) return { ok: false, error: await errorMessage(created) };
  const { data: group } = (await created.json()) as { data: { group_id: number } };

  const result = await replaceTerms(group.group_id, checked.terms);
  if (!result.ok) {
    await call(`/api/v1/search_synonym_groups/${group.group_id}`, { method: "DELETE" });
    return result;
  }
  revalidatePath(PAGE);
  return result;
}

// Deletes an entry and its terms. The page sends this only once the Undo
// bar runs out.
export async function deleteSynonymGroupAction(groupId: number): Promise<SynonymActionResult> {
  if (!Number.isInteger(groupId) || groupId <= 0) {
    return { ok: false, error: "That entry no longer exists." };
  }
  const res = await call(`/api/v1/search_synonym_groups/${groupId}`, { method: "DELETE" });
  if (!res) return { ok: false, error: UNREACHABLE };
  // Already gone is what the member asked for.
  if (!res.ok && res.status !== 404) return { ok: false, error: await errorMessage(res) };
  revalidatePath(PAGE);
  return { ok: true };
}
