import { cache } from "react";
import { apiFetch } from "@/lib/api";
import type {
  ApiCollection,
  ApiSingle,
  ImportJob,
  ImportSummary,
  UserSocial,
} from "@/lib/api/types";
import {
  activeImportApiPath,
  importSummaryApiPath,
  type ImportKind,
} from "@/lib/imports/kinds";

// The member's active or paused import of this kind, or null when there is
// none (the API answers 404) or it can't be read.
export async function loadActiveImport<J extends ImportJob = ImportJob>(
  kind: ImportKind,
  userId: string,
): Promise<J | null> {
  try {
    const res = await apiFetch(activeImportApiPath(kind, userId), { cache: "no-store" });
    if (!res.ok) return null;
    const body: ApiSingle<J> = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}

// The member's linked socials, or null when they can't be read. Memoised per
// request so the linked-account check and the Steam form share one read.
export const loadSocials = cache(async (userId: string): Promise<UserSocial[] | null> => {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/socials`, { cache: "no-store" });
    if (!res.ok) return null;
    const body: ApiCollection<UserSocial> = await res.json();
    return body.data ?? [];
  } catch {
    return null;
  }
});

// Item counts for an import, so a paused import can show its progress before
// the first `advance`. Null when they can't be read.
export async function loadImportSummary(
  kind: ImportKind,
  importId: number,
): Promise<ImportSummary | null> {
  try {
    const res = await apiFetch(importSummaryApiPath(kind, importId), { cache: "no-store" });
    if (!res.ok) return null;
    const body: ApiSingle<ImportSummary> = await res.json();
    return body.data ?? null;
  } catch {
    return null;
  }
}
