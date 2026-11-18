import { headers } from "next/headers";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { imageFileProblem } from "@/lib/live-events";
import { siteOrigin } from "@/lib/site-origin";

// The Club Codex's writes shared by its server actions (app/actions/codex-
// lore.ts, codex-history.ts, codex-fun-facts.ts, codex-links.ts): the result
// shapes, the refusals as words, an entry's save and delete, its image
// upload and removal (api#410), and this site's origin for the Discord
// conversion's links.

export interface CodexActionResult {
  ok: boolean;
  id?: number;
  error?: string;
  // A create the API answered as done but without the new entry's id: it
  // may well exist, so the desk must not create it again.
  unsure?: boolean;
}

export interface CodexImageResult {
  ok: boolean;
  image?: { id: number; url: string };
  error?: string;
}

export const UNREACHABLE = "Couldn't reach the club's server. Try again.";
export const NOT_OPEN = "The Club Codex isn't open to you right now.";

// The words for one part's refusals.
export interface EntryWords {
  // An entry that no longer exists, on edit.
  gone: string;
  // An entry that no longer exists, on delete.
  goneAlready: string;
  // A create without the new entry's id (see `unsure`).
  unsure: string;
}

const ERRORS: Record<string, string> = {
  backblaze_not_configured: "Image uploads aren't set up on the club's server yet.",
  backblaze_request_failed: "The image store didn't take it. Try again.",
};

export function validId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

// A title as saved: NUL dropped, spaces squeezed, trimmed.
export function cleanTitle(title: unknown): string {
  return typeof title === "string" ? title.replaceAll("\u0000", "").replace(/\s+/g, " ").trim() : "";
}

// This site's origin, so a link to one of its pages works from Discord
// (lib/site-origin.ts says where it comes from).
export async function siteUrl(): Promise<string | null> {
  return siteOrigin(process.env, process.env.NODE_ENV === "development" ? await headers() : null);
}

export async function failure(res: Response, notFound: string): Promise<CodexActionResult> {
  if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
  if (res.status === 404) return { ok: false, error: notFound };
  return { ok: false, error: apiErrorMessage(await readApiError(res), ERRORS) };
}

export async function entryId(res: Response): Promise<number | undefined> {
  try {
    const body = (await res.json()) as { data?: { id?: unknown } };
    return validId(body.data?.id) ? body.data.id : undefined;
  } catch {
    return undefined;
  }
}

// Creates an entry in `collection` (no `id`) or edits it, with `data` as the
// request's `data`.
export async function saveEntry(
  collection: "lore_entries" | "history_events",
  id: number | null,
  data: Record<string, unknown>,
  words: EntryWords,
): Promise<CodexActionResult> {
  const path = id === null ? `/api/v1/codex/${collection}` : `/api/v1/codex/${collection}/${id}`;
  try {
    const res = await apiFetch(path, { method: id === null ? "POST" : "PATCH", body: JSON.stringify({ data }), cache: "no-store" });
    if (!res.ok) return failure(res, id === null ? NOT_OPEN : words.gone);
    if (id !== null) return { ok: true, id };
    const created = await entryId(res);
    return created ? { ok: true, id: created } : { ok: false, unsure: true, error: words.unsure };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

export async function deleteEntry(
  collection: "lore_entries" | "history_events",
  id: number,
  words: EntryWords,
): Promise<CodexActionResult> {
  if (!validId(id)) return { ok: false, error: words.goneAlready };
  try {
    const res = await apiFetch(`/api/v1/codex/${collection}/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) return failure(res, words.goneAlready);
    return { ok: true, id };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

// Uploads one image (the form's `file`) to an entry's images. `gone` is the
// words for an entry that no longer exists.
export async function uploadEntryImage(id: number, formData: FormData, gone: string): Promise<CodexImageResult> {
  if (!validId(id)) return { ok: false, error: gone };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image file." };
  const problem = imageFileProblem(file);
  if (problem) return { ok: false, error: problem.replace(", or link it by URL", "") };
  const form = new FormData();
  form.append("data[file]", file, file.name);
  try {
    const res = await apiFetch(`/api/v1/codex/entries/${id}/images`, { method: "POST", body: form, cache: "no-store" });
    if (!res.ok) return failure(res, gone);
    const body = (await res.json()) as { data?: { id?: unknown; url?: unknown } };
    const image = body.data;
    if (!validId(image?.id) || typeof image.url !== "string") return { ok: false, error: "The upload came back without its image." };
    return { ok: true, image: { id: image.id, url: image.url } };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

// Removes images from an entry, one at a time; one already gone is fine.
export async function deleteEntryImages(id: number, imageIds: readonly number[], gone: string): Promise<CodexActionResult> {
  for (const imageId of imageIds) {
    try {
      const res = await apiFetch(`/api/v1/codex/entries/${id}/images/${imageId}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok && res.status !== 404) return failure(res, gone);
    } catch {
      return { ok: false, error: UNREACHABLE };
    }
  }
  return { ok: true, id };
}
