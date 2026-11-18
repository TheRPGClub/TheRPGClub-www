"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
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
import { isHistoryKind } from "@/lib/codex/history";
import { CODEX_PATH, HISTORY_PATH } from "@/lib/codex/paths";
import { DESCRIPTION_SCHEMA, STORY_MAX, sanitizeStory, storyPlainText } from "@/lib/codex/story-schema";
import type { DatePrecision } from "@/lib/codex/types";

// Writing a History Event from its desk (www#126, design 5D), for Admins and
// above. The desk saves in steps, each its own action, so no request
// carries more than one image: the History Event is created or edited
// (`saveHistoryEventAction`), the images taken off the gallery are removed
// (`removeHistoryImagesAction`), then each new photo uploads
// (`uploadHistoryImageAction`). Its images are a plain gallery (api#410),
// not placed in the description.
//
// Only a History Event's own fields are sent (the API refuses any other
// key): title, kind, occurred_on, date_precision, and the description as
// rich_body with its Discord markdown (body), or both null when there is
// none.

export interface HistoryDraft {
  title: string;
  kind: string | null;
  occurred_on: string | null;
  date_precision: DatePrecision | null;
  richBody: unknown;
}

const GONE = "That History Event is gone. Someone may have deleted it.";
const PRECISIONS: readonly string[] = ["day", "month", "year"];

function revalidate() {
  revalidatePath(CODEX_PATH);
  revalidatePath(HISTORY_PATH);
  revalidatePath("/");
}

// Creates the History Event (no `id`) or edits it.
export async function saveHistoryEventAction(id: number | null, draft: HistoryDraft): Promise<CodexActionResult> {
  if (id !== null && !validId(id)) return { ok: false, error: GONE };
  const title = cleanTitle(draft.title);
  if (!title) return { ok: false, error: "Give the History Event a title." };
  if (title.length > TITLE_MAX) return { ok: false, error: `A title fits in ${TITLE_MAX} characters.` };
  if (!isHistoryKind(draft.kind)) return { ok: false, error: "Pick the History Event Kind." };
  const dated =
    typeof draft.occurred_on === "string" && /^\d{4}-\d{2}-\d{2}$/.test(draft.occurred_on) && PRECISIONS.includes(draft.date_precision ?? "");
  if (!dated) return { ok: false, error: "Give the History Event a date." };
  const description = sanitizeStory(draft.richBody, DESCRIPTION_SCHEMA);
  if (description && storyPlainText(description).length > STORY_MAX) {
    return { ok: false, error: `A description fits in ${STORY_MAX} characters. Trim it a little.` };
  }
  const body = description ? storyToDiscord(description, { siteUrl: await siteUrl() }) : "";
  const data = {
    title,
    kind: draft.kind,
    occurred_on: draft.occurred_on,
    date_precision: draft.date_precision,
    rich_body: body ? description : null,
    body: body || null,
  };
  const path = id === null ? "/api/v1/codex/history_events" : `/api/v1/codex/history_events/${id}`;
  try {
    const res = await apiFetch(path, {
      method: id === null ? "POST" : "PATCH",
      body: JSON.stringify({ data }),
      cache: "no-store",
    });
    if (!res.ok) return failure(res, id === null ? "The Club Codex isn't open to you right now." : GONE);
    const saved = (await entryId(res)) ?? id ?? undefined;
    revalidate();
    return { ok: true, id: saved };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}

// Uploads one photo (`file`) to the History Event's gallery.
export async function uploadHistoryImageAction(id: number, formData: FormData): Promise<CodexImageResult> {
  const result = await uploadEntryImage(id, formData, GONE);
  if (result.ok) revalidate();
  return result;
}

// Removes images taken off the History Event's gallery.
export async function removeHistoryImagesAction(id: number, imageIds: number[]): Promise<CodexActionResult> {
  if (!validId(id)) return { ok: false, error: GONE };
  const ids = Array.isArray(imageIds) ? imageIds.filter(validId) : [];
  const result = await deleteEntryImages(id, ids, GONE);
  if (ids.length > 0) revalidate();
  return result;
}

export async function deleteHistoryEventAction(id: number): Promise<CodexActionResult> {
  if (!validId(id)) return { ok: false, error: "That History Event is gone already." };
  try {
    const res = await apiFetch(`/api/v1/codex/history_events/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) return failure(res, "That History Event is gone already.");
    revalidate();
    return { ok: true, id };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}
