import { apiFetch } from "@/lib/api";
import type { ApiSingle, ImportJob, ImportSummary } from "@/lib/api/types";
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
