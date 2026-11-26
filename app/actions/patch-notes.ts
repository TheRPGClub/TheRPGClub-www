"use server";

import { revalidatePath } from "next/cache";

import { siteUrl } from "@/lib/api/codex-write";
import {
  createPatch,
  deletePatch,
  fetchStaffPatch,
  patchStep,
  queuePatchPost,
  savePatch,
  type PatchActionResult,
} from "@/lib/api/patch-write";
import type { Patch, PatchPostResult } from "@/lib/patch-notes/types";
import { PATCH_TITLE_MAX, patchFields, patchTemplate } from "@/lib/patch-notes/patch-draft";
import { PATCH_NOTES_PATH, patchPath } from "@/lib/patch-notes/paths";
import { PATCH_EDITOR_PATH } from "@/lib/patch-notes/editor-paths";

// The Patch editor's writes (www#237), for Admins and above (the API
// decides). A save sends the title, the sanitized value and the Discord
// markdown made from it here, so the stored `body` and `cut_body` always
// match `rich_body`. Publishing a changed Patch saves it first. Length
// never blocks a save or a publish: past 4000 the post is cut.

export interface PatchDraft {
  title: string;
  richBody: unknown;
}

function revalidate(number?: number) {
  revalidatePath(PATCH_EDITOR_PATH);
  revalidatePath(PATCH_NOTES_PATH);
  if (number) revalidatePath(patchPath(number));
}

async function fields(draft: PatchDraft, options?: { keepEmpty?: boolean }) {
  return patchFields(typeof draft.title === "string" ? draft.title : "", draft.richBody, await siteUrl(), options);
}

function tooLong(draft: PatchDraft): PatchActionResult | null {
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  return title.length > PATCH_TITLE_MAX ? { ok: false, error: `A title fits in ${PATCH_TITLE_MAX} characters.` } : null;
}

// Starts a draft from the template, its empty bullets kept to write in;
// the editor opens on its number.
export async function createPatchAction(): Promise<PatchActionResult> {
  const result = await createPatch(await fields({ title: "", richBody: patchTemplate() }, { keepEmpty: true }));
  if (result.ok) revalidate();
  if (result.ok && !result.patch?.number) return { ok: false, error: "The draft was made but came back without its number. Find it in the list." };
  return result;
}

export async function savePatchAction(number: number, draft: PatchDraft): Promise<PatchActionResult> {
  const refused = tooLong(draft);
  if (refused) return refused;
  const result = await savePatch(number, await fields(draft));
  if (result.ok) revalidate(number);
  return result;
}

// Publishes the Patch, saving `draft` first when given (unsaved changes).
// When the save went through but the publish didn't, the refusal carries
// the saved Patch, so the editor knows its changes are saved.
export async function publishPatchAction(number: number, draft: PatchDraft | null): Promise<PatchActionResult> {
  let saved: PatchActionResult | null = null;
  if (draft) {
    saved = await savePatchAction(number, draft);
    if (!saved.ok) return saved;
  }
  const result = await patchStep(number, "publish");
  if (result.ok) revalidate(number);
  return result.ok || !saved?.patch ? result : { ...result, patch: saved.patch };
}

export async function unpublishPatchAction(number: number): Promise<PatchActionResult> {
  const result = await patchStep(number, "unpublish");
  if (result.ok) revalidate(number);
  return result;
}

export async function deletePatchAction(number: number): Promise<PatchActionResult> {
  const result = await deletePatch(number);
  if (result.ok) revalidate(number);
  return result;
}

// Post to #patch-notes ("post") or Update the post ("update"), saving
// `draft` first when given (unsaved changes), as Publish does: the post
// carries the Patch as saved (www#239).
export async function postPatchAction(number: number, step: "post" | "update", draft: PatchDraft | null): Promise<PatchPostResult> {
  let patch: Patch | undefined;
  if (draft) {
    const saved = await savePatchAction(number, draft);
    if (!saved.ok) return saved;
    patch = saved.patch;
  }
  const result = await queuePatchPost(number, step === "post" ? "post" : "update_post");
  if (result.ok) revalidatePath(PATCH_EDITOR_PATH);
  return { ...result, patch: result.patch ?? patch };
}

// The Patch re-read once its post job settles, for its post state.
export async function readPatchAction(number: number): Promise<Patch | null> {
  const patch = await fetchStaffPatch(number);
  return patch === "not_found" ? null : patch;
}
