"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ActionResult } from "@/app/actions/game-lists";
import type {
  ApiSingle,
  ImportJob,
  ImportReview,
  ImportStatus,
  InvalidCsvRowError,
} from "@/lib/api/types";
import {
  IMPORT_KINDS,
  importApiPath,
  importErrorMessage,
  importItemApiPath,
  importKindHref,
  importsHubHref,
  isImportKind,
  isMemberId,
  isRecordId,
  type ImportKind,
} from "@/lib/imports/kinds";

// Server actions for every import kind. They take the kind and build the API
// path from IMPORT_KINDS, so Steam and Completionator reuse them as is. The
// API enforces owner-only on each call; the guards here only keep untrusted
// arguments out of the request path.

export interface ImportActionResult<T> extends ActionResult<T> {
  // The raw API error code (e.g. `item_not_pending`), so the client can
  // recover instead of only showing a message.
  code?: string;
}

const BAD_REQUEST: ImportActionResult<never> = { ok: false, error: "Invalid request." };

async function failure(res: Response): Promise<ImportActionResult<never>> {
  let code: string | undefined;
  try {
    const body = await res.json();
    code = body.error ?? body.message;
  } catch {
    // non-JSON error body
  }
  return { ok: false, code, error: importErrorMessage(code, res.status) };
}

function revalidateImportPages(kind: ImportKind, userId: string) {
  revalidatePath(`/members/${userId}`);
  revalidatePath(importsHubHref(userId));
  for (const subpath of IMPORT_KINDS[kind].affects) {
    revalidatePath(`/members/${userId}/${subpath}`);
  }
}

function validArgs(kind: unknown, userId: unknown, id: unknown): kind is ImportKind {
  return isImportKind(kind) && isMemberId(userId) && isRecordId(id);
}

// Runs the server-side loop to the next row that needs a human. An item of
// null with an active import means "call again" (see shouldAdvanceAgain).
export async function advanceImportAction(
  kind: ImportKind,
  userId: string,
  importId: number,
): Promise<ImportActionResult<ImportReview>> {
  if (!validArgs(kind, userId, importId)) return BAD_REQUEST;

  const res = await apiFetch(`${importApiPath(kind, importId)}/advance`, {
    method: "POST",
    body: JSON.stringify({ data: {} }),
  });
  if (!res.ok) return failure(res);

  const body = (await res.json()) as ApiSingle<ImportReview>;
  // Advance can auto-apply rows, so the member's lists may have changed.
  revalidateImportPages(kind, userId);
  return { ok: true, data: body.data };
}

export type ImportSelection = { game_id: number } | { igdb_id: number };

export async function applyImportItemAction(
  kind: ImportKind,
  userId: string,
  itemId: number,
  selection: ImportSelection,
): Promise<ImportActionResult<null>> {
  if (!validArgs(kind, userId, itemId)) return BAD_REQUEST;
  const id = "game_id" in selection ? selection.game_id : selection.igdb_id;
  if (!isRecordId(id)) return { ok: false, error: importErrorMessage("game_id_or_igdb_id_required") };
  const data = "game_id" in selection ? { game_id: id } : { igdb_id: id };

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/apply`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  if (!res.ok) return failure(res);

  revalidateImportPages(kind, userId);
  return { ok: true, data: null };
}

export async function skipImportItemAction(
  kind: ImportKind,
  userId: string,
  itemId: number,
): Promise<ImportActionResult<null>> {
  if (!validArgs(kind, userId, itemId)) return BAD_REQUEST;

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/skip`, {
    method: "POST",
    body: JSON.stringify({ data: {} }),
  });
  if (!res.ok) return failure(res);
  return { ok: true, data: null };
}

// Re-searches GameDB for a different title. Returns the review payload with
// the new candidates; the client still calls advance afterwards, since a
// single exact match is applied there.
export async function remapImportItemAction(
  kind: ImportKind,
  userId: string,
  itemId: number,
  title: string,
): Promise<ImportActionResult<ImportReview>> {
  if (!validArgs(kind, userId, itemId)) return BAD_REQUEST;
  const trimmed = typeof title === "string" ? title.trim() : "";
  if (!trimmed) return { ok: false, code: "title_required", error: importErrorMessage("title_required") };

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/remap`, {
    method: "POST",
    body: JSON.stringify({ data: { title: trimmed.slice(0, 500) } }),
  });
  if (!res.ok) return failure(res);

  const body = (await res.json()) as ApiSingle<ImportReview>;
  return { ok: true, data: body.data };
}

const SETTABLE_STATUSES: ReadonlySet<ImportStatus> = new Set(["active", "paused", "canceled"]);

// Pause (`paused`), resume (`active`) or cancel (`canceled`) an import.
export async function setImportStatusAction(
  kind: ImportKind,
  userId: string,
  importId: number,
  status: ImportStatus,
): Promise<ImportActionResult<ImportJob>> {
  if (!validArgs(kind, userId, importId) || !SETTABLE_STATUSES.has(status)) return BAD_REQUEST;

  const res = await apiFetch(importApiPath(kind, importId), {
    method: "PATCH",
    body: JSON.stringify({ data: { status } }),
  });
  if (!res.ok) return failure(res);

  const body = (await res.json()) as ApiSingle<ImportJob>;
  revalidateImportPages(kind, userId);
  return { ok: true, data: body.data };
}

// Re-reads an import, for when the client's copy went stale (409).
export async function loadImportAction(
  kind: ImportKind,
  userId: string,
  importId: number,
): Promise<ImportActionResult<ImportJob>> {
  if (!validArgs(kind, userId, importId)) return BAD_REQUEST;

  const res = await apiFetch(importApiPath(kind, importId), { cache: "no-store" });
  if (!res.ok) return failure(res);
  const body = (await res.json()) as ApiSingle<ImportJob>;
  return { ok: true, data: body.data };
}

// --- Collection CSV ---------------------------------------------------------

// Matches the API's MAX_CSV_BYTES; next.config's serverActions.bodySizeLimit
// leaves room above it for the multipart overhead.
const MAX_CSV_BYTES = 2 * 1024 * 1024;

export interface CsvImportFormState {
  error: string | null;
  rowErrors: InvalidCsvRowError[];
}

// Starts a collection CSV import from an uploaded file. The API parses and
// validates the file; a bad file comes back as 422 `invalid_csv` with one
// error per problem, and nothing is created. Test mode is never sent: on the
// API it rolls back the rows, which leaves nothing to review.
export async function startCsvImportAction(
  userId: string,
  _state: CsvImportFormState,
  formData: FormData,
): Promise<CsvImportFormState> {
  if (!isMemberId(userId)) return { error: "Invalid request.", rowErrors: [] };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to upload.", rowErrors: [] };
  }
  if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
    return { error: "That isn't a CSV file. Save the template as .csv and try again.", rowErrors: [] };
  }
  if (file.size > MAX_CSV_BYTES) {
    return { error: "The file is larger than 2 MB. Split it into smaller files.", rowErrors: [] };
  }

  const res = await apiFetch(`/api/v1/users/${userId}/${IMPORT_KINDS.csv.imports}`, {
    method: "POST",
    body: JSON.stringify({
      data: { csv_text: await file.text(), source_file_name: file.name.slice(0, 255) },
    }),
  });

  if (!res.ok) {
    let body: { error?: string; message?: string; errors?: InvalidCsvRowError[] } = {};
    try {
      body = await res.json();
    } catch {
      // non-JSON error body
    }
    return {
      error: importErrorMessage(body.error ?? body.message, res.status),
      rowErrors: Array.isArray(body.errors) ? body.errors : [],
    };
  }

  revalidatePath(importsHubHref(userId));
  redirect(importKindHref(userId, "csv"));
}
