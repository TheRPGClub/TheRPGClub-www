"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { fetchCodexEntry } from "@/lib/api/codex";
import { storyToDiscord } from "@/lib/codex/discord-markdown";
import { storyImageIds } from "@/lib/codex/lore-story";
import { CODEX_PATH, LORE_PATH } from "@/lib/codex/paths";
import { LORE_SCHEMA, STORY_MAX, sanitizeStory, storyPlainText } from "@/lib/codex/story-schema";
import type { DatePrecision } from "@/lib/codex/types";
import { imageFileProblem } from "@/lib/live-events";

// Writing a Lore Entry from the desk (www#125, design 5D). The desk saves in
// steps, each its own action, so no request carries more than one image:
//
// - new: `saveLoreEntryAction` creates the entry (its story without the
//   photos not uploaded yet), then `uploadLoreImageAction` once per photo,
//   then `saveLoreEntryAction` again with the photos' ids and urls in place;
// - edit: `pruneLoreImagesAction` deletes the images the story no longer
//   places (so a full gallery has room), the new photos upload, then one
//   save, so the API's `images` always matches the story.
//
// Every save sanitizes the story, holds it to 4000 characters of text and
// sends its Discord markdown (`body`, images dropped) with it. Only the Lore
// Entry's own fields are sent: the API refuses any other key.

export interface LoreActionResult {
  ok: boolean;
  id?: number;
  error?: string;
}

export interface LoreDraft {
  title: string;
  richBody: unknown;
  occurred_on: string | null;
  date_precision: DatePrecision | null;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";
const TITLE_MAX = 100;
const ERRORS: Record<string, string> = {
  backblaze_not_configured: "Image uploads aren't set up on the club's server yet.",
  backblaze_request_failed: "The image store didn't take it. Try again.",
};

function validId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

function revalidate(id?: number) {
  revalidatePath(CODEX_PATH);
  revalidatePath(LORE_PATH);
  if (id) revalidatePath(`${LORE_PATH}/${id}`);
}

// This site's origin, so a link to one of its pages works from Discord.
async function siteUrl(): Promise<string | null> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto.split(",")[0].trim()}://${host}`;
}

async function failure(res: Response, notFound: string): Promise<LoreActionResult> {
  if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
  if (res.status === 404) return { ok: false, error: notFound };
  return { ok: false, error: apiErrorMessage(await readApiError(res), ERRORS) };
}

async function entryId(res: Response): Promise<number | undefined> {
  try {
    const body = (await res.json()) as { data?: { id?: unknown } };
    return validId(body.data?.id) ? body.data.id : undefined;
  } catch {
    return undefined;
  }
}

// Creates the Lore Entry (no `id`) or edits it.
export async function saveLoreEntryAction(id: number | null, draft: LoreDraft): Promise<LoreActionResult> {
  if (id !== null && !validId(id)) return { ok: false, error: "That Lore Entry is gone." };
  const title = typeof draft.title === "string" ? draft.title.replaceAll("\u0000", "").replace(/\s+/g, " ").trim() : "";
  if (!title) return { ok: false, error: "Give the Lore Entry a title." };
  if (title.length > TITLE_MAX) return { ok: false, error: `A title fits in ${TITLE_MAX} characters.` };
  const story = sanitizeStory(draft.richBody, LORE_SCHEMA);
  if (!story) return { ok: false, error: "Write the story first." };
  if (storyPlainText(story).length > STORY_MAX) {
    return { ok: false, error: `A story fits in ${STORY_MAX} characters. Trim it a little.` };
  }
  const body = storyToDiscord(story, { siteUrl: await siteUrl() });
  if (!body) return { ok: false, error: "Write the story first." };
  const dated = draft.occurred_on && draft.date_precision;
  const data = {
    title,
    rich_body: story,
    body,
    occurred_on: dated ? draft.occurred_on : null,
    date_precision: dated ? draft.date_precision : null,
  };
  const path = id === null ? "/api/v1/codex/lore_entries" : `/api/v1/codex/lore_entries/${id}`;
  try {
    const res = await apiFetch(path, {
      method: id === null ? "POST" : "PATCH",
      body: JSON.stringify({ data }),
      cache: "no-store",
    });
    if (!res.ok) return failure(res, id === null ? "The Club Codex isn't open to you right now." : "That Lore Entry is gone. Someone may have deleted it.");
    const saved = (await entryId(res)) ?? id ?? undefined;
    revalidate(saved);
    return { ok: true, id: saved };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

export interface LoreImageResult {
  ok: boolean;
  image?: { id: number; url: string };
  error?: string;
}

// Uploads one photo (`file`) to the entry's images.
export async function uploadLoreImageAction(id: number, formData: FormData): Promise<LoreImageResult> {
  if (!validId(id)) return { ok: false, error: "That Lore Entry is gone." };
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose an image file." };
  const problem = imageFileProblem(file);
  if (problem) return { ok: false, error: problem.replace(", or link it by URL", "") };
  const form = new FormData();
  form.append("data[file]", file, file.name);
  try {
    const res = await apiFetch(`/api/v1/codex/entries/${id}/images`, { method: "POST", body: form, cache: "no-store" });
    if (!res.ok) return failure(res, "That Lore Entry is gone. Someone may have deleted it.");
    const body = (await res.json()) as { data?: { id?: unknown; url?: unknown } };
    const image = body.data;
    if (!validId(image?.id) || typeof image.url !== "string") return { ok: false, error: "The upload came back without its image." };
    return { ok: true, image: { id: image.id, url: image.url } };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

// Deletes the entry's images that `story` doesn't place.
export async function pruneLoreImagesAction(id: number, story: unknown): Promise<LoreActionResult> {
  if (!validId(id)) return { ok: false, error: "That Lore Entry is gone." };
  const keep = new Set(Array.isArray(story) ? storyImageIds(story) : []);
  const entry = await fetchCodexEntry("lore_entry", id);
  if (entry === "not_found") return { ok: false, error: "That Lore Entry is gone. Someone may have deleted it." };
  if (entry === null) return { ok: false, error: UNREACHABLE };
  for (const image of entry.images.filter((image) => !keep.has(image.id))) {
    try {
      const res = await apiFetch(`/api/v1/codex/entries/${id}/images/${image.id}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok && res.status !== 404) return failure(res, "That Lore Entry is gone.");
    } catch {
      return { ok: false, error: UNREACHABLE };
    }
  }
  return { ok: true, id };
}

export async function deleteLoreEntryAction(id: number): Promise<LoreActionResult> {
  if (!validId(id)) return { ok: false, error: "That Lore Entry is gone already." };
  try {
    const res = await apiFetch(`/api/v1/codex/lore_entries/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) return failure(res, "That Lore Entry is gone already.");
    revalidate(id);
    return { ok: true, id };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}
