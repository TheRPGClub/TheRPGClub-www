import { notFound } from "next/navigation";

import { featureView } from "@/lib/features";
import { requireAuth } from "@/lib/session";
import { isAdminOrAbove } from "@/lib/staff";

// The Patch editor's gate (www#237): Admins and Superadmins only, while
// Patch Notes is open (Preview or Live). Everyone else, Moderators
// included, gets the 404, as if the editor weren't there. Server-only.
export async function requirePatchEditor() {
  const session = await requireAuth();
  if (!isAdminOrAbove(session.membership)) notFound();
  if (!featureView(session.features).canOpen("patch_notes")) notFound();
  return session;
}
