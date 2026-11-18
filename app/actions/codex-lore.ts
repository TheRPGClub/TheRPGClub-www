"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { fetchCodexEntry } from "@/lib/api/codex";
import {
  TITLE_MAX,
  UNREACHABLE,
  cleanTitle,
  deleteEntryImages,
  entryId,
  failure,
  siteUrl,
  uploadEntryImage,
  validId,
  type CodexActionResult,
  type CodexImageResult,
} from "@/lib/api/codex-write";
import { storyToDiscord } from "@/lib/codex/discord-markdown";
import { storyImageIds } from "@/lib/codex/lore-story";
import { CODEX_PATH, LORE_PATH } from "@/lib/codex/paths";
import { LORE_SCHEMA, STORY_MAX, sanitizeStory, storyPlainText } from "@/lib/codex/story-schema";
import type { DatePrecision } from "@/lib/codex/types";

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

export type LoreActionResult = CodexActionResult;
export type LoreImageResult = CodexImageResult;

export interface LoreDraft {
  title: string;
  richBody: unknown;
  occurred_on: string | null;
  date_precision: DatePrecision | null;
}

const GONE = "That Lore Entry is gone. Someone may have deleted it.";

function revalidate(id?: number) {
  revalidatePath(CODEX_PATH);
  revalidatePath(LORE_PATH);
  if (id) revalidatePath(`${LORE_PATH}/${id}`);
}

// Creates the Lore Entry (no `id`) or edits it.
export async function saveLoreEntryAction(id: number | null, draft: LoreDraft): Promise<LoreActionResult> {
  if (id !== null && !validId(id)) return { ok: false, error: "That Lore Entry is gone." };
  const title = cleanTitle(draft.title);
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

// Uploads one photo (`file`) to the entry's images.
export async function uploadLoreImageAction(id: number, formData: FormData): Promise<LoreImageResult> {
  return uploadEntryImage(id, formData, GONE);
}

// Deletes the entry's images that `story` doesn't place.
export async function pruneLoreImagesAction(id: number, story: unknown): Promise<LoreActionResult> {
  if (!validId(id)) return { ok: false, error: "That Lore Entry is gone." };
  const keep = new Set(Array.isArray(story) ? storyImageIds(story) : []);
  const entry = await fetchCodexEntry("lore_entry", id);
  if (entry === "not_found") return { ok: false, error: "That Lore Entry is gone. Someone may have deleted it." };
  if (entry === null) return { ok: false, error: UNREACHABLE };
  const extra = entry.images.filter((image) => !keep.has(image.id)).map((image) => image.id);
  return deleteEntryImages(id, extra, "That Lore Entry is gone.");
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
