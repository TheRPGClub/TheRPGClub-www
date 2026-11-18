import { headers } from "next/headers";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { imageFileProblem } from "@/lib/live-events";

// The Club Codex's writes shared by its server actions (app/actions/codex-
// lore.ts, codex-history.ts): the result shapes, the refusals as words, an
// entry's image upload and removal (api#410), and this site's origin for the
// Discord conversion's links.

export interface CodexActionResult {
  ok: boolean;
  id?: number;
  error?: string;
}

export interface CodexImageResult {
  ok: boolean;
  image?: { id: number; url: string };
  error?: string;
}

export const UNREACHABLE = "Couldn't reach the club's server. Try again.";
export const TITLE_MAX = 100;

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

// This site's origin, so a link to one of its pages works from Discord.
export async function siteUrl(): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto.split(",")[0].trim()}://${host}`;
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
