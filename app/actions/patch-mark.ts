"use server";

import { putPatchMark } from "@/lib/api/patch-mark";
import type { PatchMarkMoved } from "@/lib/patch-notes/patch-mark";
import { getSession } from "@/lib/session";

// Opening /patch-notes or a Patch page (ticket www#238) moves the member's
// Patch Mark to the newest Patch shown. Null when signed out or when the
// move failed; the mark then stays where it was and the NEW marks with it.
export async function movePatchMarkAction(number: number): Promise<PatchMarkMoved | null> {
  if (!Number.isInteger(number) || number < 1) return null;
  const session = await getSession();
  if (!session) return null;
  return putPatchMark(session.principal.discord_id, number);
}
