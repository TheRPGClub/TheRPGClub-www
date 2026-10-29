"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ActionResult } from "@/app/actions/game-lists";
import type {
  ApiCollection,
  ApiSingle,
  ImportJob,
  ImportReview,
  ImportStatus,
  InvalidCsvRowError,
  UserNowPlaying,
} from "@/lib/api/types";
import { resolveEntryId } from "@/lib/api/game-list-entry";
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

// --- Completion steps (Completionator) --------------------------------------

// Sets the row's game. Unlike `apply` it doesn't finish the row: it returns
// the review of the matched row (add, confirm or update the completion), or
// `next_step` auto_added / auto_skipped when the API finished it.
export async function matchImportItemAction(
  kind: ImportKind,
  userId: string,
  itemId: number,
  selection: ImportSelection,
): Promise<ImportActionResult<ImportReview>> {
  if (!validArgs(kind, userId, itemId)) return BAD_REQUEST;
  const id = "game_id" in selection ? selection.game_id : selection.igdb_id;
  if (!isRecordId(id)) return { ok: false, error: importErrorMessage("game_id_or_igdb_id_required") };
  const data = "game_id" in selection ? { game_id: id } : { igdb_id: id };

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/match`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  if (!res.ok) return failure(res);

  const body = (await res.json()) as ApiSingle<ImportReview>;
  // Match can add the completion straight away.
  revalidateImportPages(kind, userId);
  return { ok: true, data: body.data };
}

export interface AddCompletionInput {
  completion_type: string;
  platform_id: number | null;
  // YYYY-MM-DD, or null for an unknown date.
  completed_at: string | null;
  final_playtime_hours: number | null;
}

// Adds the row's completion. `removeNowPlayingIds` are the member's Now
// Playing entries for the game to remove afterwards, as the bot offers; that
// part is best effort and never fails the add.
export async function addCompletionImportItemAction(
  kind: ImportKind,
  userId: string,
  itemId: number,
  input: AddCompletionInput,
  removeNowPlayingIds: number[] = [],
): Promise<ImportActionResult<null>> {
  if (!validArgs(kind, userId, itemId)) return BAD_REQUEST;
  const playtime = input.final_playtime_hours;
  const data = {
    completion_type: String(input.completion_type),
    platform_id: isRecordId(input.platform_id) ? input.platform_id : null,
    completed_at:
      typeof input.completed_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.completed_at)
        ? input.completed_at
        : null,
    final_playtime_hours:
      typeof playtime === "number" && Number.isFinite(playtime) && playtime >= 0 ? playtime : null,
  };

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/add_completion`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
  if (!res.ok) return failure(res);

  const ids = Array.isArray(removeNowPlayingIds) ? removeNowPlayingIds.filter(isRecordId) : [];
  if (ids.length > 0) {
    await Promise.allSettled(
      ids.map((id) => apiFetch(`/api/v1/now_playing/${id}`, { method: "DELETE" })),
    );
    revalidatePath(`/members/${userId}/now-playing-games`);
  }

  revalidateImportPages(kind, userId);
  return { ok: true, data: null };
}

const UPDATE_FIELDS: ReadonlySet<string> = new Set(["type", "date", "playtime"]);

// Copies the chosen row values (type, date, playtime) onto the member's
// existing completion of the game.
export async function updateCompletionImportItemAction(
  kind: ImportKind,
  userId: string,
  itemId: number,
  fields: string[],
): Promise<ImportActionResult<null>> {
  if (!validArgs(kind, userId, itemId)) return BAD_REQUEST;
  const selected = Array.isArray(fields) ? fields.filter((f) => UPDATE_FIELDS.has(f)) : [];
  if (selected.length === 0) return { ok: false, code: "invalid_fields", error: importErrorMessage("invalid_fields") };

  const res = await apiFetch(`${importItemApiPath(kind, itemId)}/update_completion`, {
    method: "POST",
    body: JSON.stringify({ data: { fields: selected } }),
  });
  if (!res.ok) return failure(res);

  revalidateImportPages(kind, userId);
  return { ok: true, data: null };
}

// The member's Now Playing entries for a game, so the review can offer to
// remove the game once its completion is added. Empty when it can't tell.
export async function nowPlayingEntryIdsAction(
  userId: string,
  gameId: number,
): Promise<ImportActionResult<number[]>> {
  if (!isMemberId(userId) || !isRecordId(gameId)) return BAD_REQUEST;

  const res = await apiFetch(`/api/v1/users/${userId}/now_playing?per=500`, { cache: "no-store" });
  if (!res.ok) return { ok: true, data: [] };
  const body = (await res.json()) as ApiCollection<UserNowPlaying>;
  const ids = (body.data ?? [])
    .filter((entry) => entry.gamedb_game_id === gameId)
    .map((entry) => resolveEntryId("now_playing", entry))
    .filter(isRecordId);
  return { ok: true, data: ids };
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

// The uploaded CSV file, or the message to show when it's missing or unusable.
function csvUpload(formData: FormData, notCsvHint: string): File | string {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return "Choose a CSV file to upload.";
  if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
    return `That isn't a CSV file. ${notCsvHint}`;
  }
  if (file.size > MAX_CSV_BYTES) return "The file is larger than 2 MB. Split it into smaller files.";
  return file;
}

// A rejected upload: 422 `invalid_csv` lists every problem in `errors`.
async function csvUploadFailure(res: Response): Promise<CsvImportFormState> {
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

  const file = csvUpload(formData, "Save the template as .csv and try again.");
  if (typeof file === "string") return { error: file, rowErrors: [] };

  const res = await apiFetch(`/api/v1/users/${userId}/${IMPORT_KINDS.csv.imports}`, {
    method: "POST",
    body: JSON.stringify({
      data: { csv_text: await file.text(), source_file_name: file.name.slice(0, 255) },
    }),
  });

  if (!res.ok) return csvUploadFailure(res);

  revalidatePath(importsHubHref(userId));
  redirect(importKindHref(userId, "csv"));
}

// --- Completionator ---------------------------------------------------------

// Starts a Completionator import from the exported CSV. The API parses it and
// answers 422 `invalid_csv` when it can't. No test mode, as for the CSV import.
export async function startCompletionatorImportAction(
  userId: string,
  _state: CsvImportFormState,
  formData: FormData,
): Promise<CsvImportFormState> {
  if (!isMemberId(userId)) return { error: "Invalid request.", rowErrors: [] };

  const file = csvUpload(formData, "Upload the .csv file Completionator exported.");
  if (typeof file === "string") return { error: file, rowErrors: [] };

  const res = await apiFetch(`/api/v1/users/${userId}/${IMPORT_KINDS.completionator.imports}`, {
    method: "POST",
    // Completionator's field is `source_filename` (CSV's is `source_file_name`).
    body: JSON.stringify({
      data: { csv_text: await file.text(), source_filename: file.name.slice(0, 255) },
    }),
  });

  if (!res.ok) return csvUploadFailure(res);

  revalidatePath(importsHubHref(userId));
  redirect(importKindHref(userId, "completionator"));
}
