"use server";

import { revalidatePath } from "next/cache";

import { coverPendingChanges, dismissPendingChange } from "@/lib/api/pending-changes";
import { patchEditPath } from "@/lib/patch-notes/editor-paths";
import type { PendingChangeActionResult } from "@/lib/patch-notes/pending-changes";

// The Patch editor's step 1 writes (www#240), for Admins and above (the
// API decides): tick what a Patch covers, dismiss and undo. Each saves at
// once, apart from the Patch's text.

export async function coverPendingChangesAction(number: number, ids: number[]): Promise<PendingChangeActionResult> {
  const result = await coverPendingChanges(number, Array.isArray(ids) ? ids : []);
  if (result.ok) revalidatePath(patchEditPath(number));
  return result;
}

export async function dismissPendingChangeAction(id: number, undo: boolean): Promise<PendingChangeActionResult> {
  return dismissPendingChange(id, undo === true);
}
