"use server";

import { revalidatePath } from "next/cache";
import { fetchCodexEntry } from "@/lib/api/codex";
import {
  UNREACHABLE,
  cleanTitle,
  deleteEntry,
  deleteEntryImages,
  saveEntry,
  siteUrl,
  uploadEntryImage,
  validId,
  type CodexActionResult,
  type CodexImageResult,
  type EntryWords,
} from "@/lib/api/codex-write";
import { richTextToDiscord } from "@/lib/rich-text/discord-markdown";
import { storyImageIds } from "@/lib/codex/lore-story";
import { CODEX_PATH, LORE_PATH } from "@/lib/codex/paths";
import { LORE_SCHEMA, STORY_MAX, TITLE_MAX, sanitizeStory, storyPlainText } from "@/lib/codex/story-schema";
import type { DatePrecision } from "@/lib/codex/types";

// Writing a Lore Entry from the desk (www#125, design 5D). The desk saves in
// steps, each its own action, so no request carries more than one image
// (hooks/use-lore-desk.ts runs them):
//
// - `saveLoreEntryAction` creates or edits the entry: its story without the
//   photos not uploaded yet;
// - `uploadLoreImageAction` uploads one photo;
// - `saveLoreEntryAction` again places the uploaded photos (their ids and
//   urls) in the story;
// - `pruneLoreImagesAction` deletes the images the saved story no longer
//   places. It only ever runs once a story without them has saved, so a
//   failed save never loses a photo.
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

const WORDS: EntryWords = {
  gone: "That Lore Entry is gone. Someone may have deleted it.",
  goneAlready: "That Lore Entry is gone already.",
  unsure: "The club's server took it but didn't say where it went. It may be on Club Lore already: check there before you publish it again.",
};

function revalidate(id?: number) {
  revalidatePath(CODEX_PATH);
  revalidatePath(LORE_PATH);
  if (id) revalidatePath(`${LORE_PATH}/${id}`);
}

// Creates the Lore Entry (no `id`) or edits it.
export async function saveLoreEntryAction(id: number | null, draft: LoreDraft): Promise<LoreActionResult> {
  if (id !== null && !validId(id)) return { ok: false, error: WORDS.gone };
  const title = cleanTitle(draft.title);
  if (!title) return { ok: false, error: "Give the Lore Entry a title." };
  if (title.length > TITLE_MAX) return { ok: false, error: `A title fits in ${TITLE_MAX} characters.` };
  const story = sanitizeStory(draft.richBody, LORE_SCHEMA);
  if (!story) return { ok: false, error: "Write the story first." };
  if (storyPlainText(story).length > STORY_MAX) {
    return { ok: false, error: `A story fits in ${STORY_MAX} characters. Trim it a little.` };
  }
  const body = richTextToDiscord(story, { siteUrl: await siteUrl() });
  if (!body) return { ok: false, error: "Write the story first." };
  const dated = draft.occurred_on && draft.date_precision;
  const data = {
    title,
    rich_body: story,
    body,
    occurred_on: dated ? draft.occurred_on : null,
    date_precision: dated ? draft.date_precision : null,
  };
  const result = await saveEntry("lore_entries", id, data, WORDS);
  if (result.ok || result.unsure) revalidate(result.id);
  return result;
}

// Uploads one photo (`file`) to the entry's images.
export async function uploadLoreImageAction(id: number, formData: FormData): Promise<LoreImageResult> {
  return uploadEntryImage(id, formData, WORDS.gone);
}

// Deletes the entry's images that `story` (the story just saved) doesn't
// place.
export async function pruneLoreImagesAction(id: number, story: unknown): Promise<LoreActionResult> {
  if (!validId(id)) return { ok: false, error: WORDS.gone };
  const keep = new Set(Array.isArray(story) ? storyImageIds(story) : []);
  const entry = await fetchCodexEntry("lore_entry", id);
  if (entry === "not_found") return { ok: false, error: WORDS.gone };
  if (entry === null) return { ok: false, error: UNREACHABLE };
  const extra = entry.images.filter((image) => !keep.has(image.id)).map((image) => image.id);
  const result = await deleteEntryImages(id, extra, WORDS.gone);
  if (result.ok && extra.length > 0) revalidate(id);
  return result;
}

export async function deleteLoreEntryAction(id: number): Promise<LoreActionResult> {
  const result = await deleteEntry("lore_entries", id, WORDS);
  if (result.ok) revalidate(id);
  return result;
}
