"use server";

import { revalidatePath } from "next/cache";

import { siteUrl } from "@/lib/api/codex-write";
import {
  createPatch,
  deletePatch,
  patchStep,
  savePatch,
  type PatchActionResult,
} from "@/lib/api/patch-write";
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

async function fields(draft: PatchDraft) {
  return patchFields(typeof draft.title === "string" ? draft.title : "", draft.richBody, await siteUrl());
}

function tooLong(draft: PatchDraft): PatchActionResult | null {
  const title = typeof draft.title === "string" ? draft.title.trim() : "";
  return title.length > PATCH_TITLE_MAX ? { ok: false, error: `A title fits in ${PATCH_TITLE_MAX} characters.` } : null;
}

// Starts a draft from the template; the editor opens on its number.
export async function createPatchAction(): Promise<PatchActionResult> {
  const result = await createPatch(await fields({ title: "", richBody: patchTemplate() }));
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
export async function publishPatchAction(number: number, draft: PatchDraft | null): Promise<PatchActionResult> {
  if (draft) {
    const saved = await savePatchAction(number, draft);
    if (!saved.ok) return saved;
  }
  const result = await patchStep(number, "publish");
  if (result.ok) revalidate(number);
  return result;
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
