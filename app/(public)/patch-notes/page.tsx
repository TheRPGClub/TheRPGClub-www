import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteUrl } from "@/lib/api/codex-write";
import { fetchPatches } from "@/lib/api/patches";
import { fetchVersions } from "@/lib/api/versions";
import { featureView } from "@/lib/features";
import { patchSeen, shouldMovePatchMark } from "@/lib/patch-notes/patch-mark";
import { PATCH_NOTES_PATH } from "@/lib/patch-notes/paths";
import { getSession } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PatchMarkMover } from "@/components/patch-notes/patch-mark-mover";
import { PatchNotesFrame } from "@/components/patch-notes/patch-notes-frame";
import { PatchStack } from "@/components/patch-notes/patch-stack";

// Patch Notes (www#236, spec api#510): what changed on the site and bot,
// newest Patch on top. Public, as Club History: the API decides what a
// Visitor reads (not found unless the Feature is Live); a Member's session
// decides theirs, as on every Feature page. A member's unseen Patches wear
// NEW for this visit, and opening the page moves their Patch Mark to the
// newest Patch (www#238).

export const metadata: Metadata = { title: "Patch Notes · The RPG Club" };

export default async function PatchNotesPage() {
  const session = await getSession();
  const features = featureView(session?.features);
  if (session && !features.canOpen("patch_notes")) notFound();
  const [patches, versions, origin] = await Promise.all([fetchPatches(), fetchVersions(), siteUrl()]);
  if (patches === "not_found") notFound();
  const seen = patchSeen(session);
  const newest = patches?.[0]?.number ?? null;

  return (
    <PatchNotesFrame session={session} path={PATCH_NOTES_PATH}>
      <PatchStack
        patches={patches}
        versions={versions}
        seen={seen}
        siteUrl={origin}
        badge={features.preview("patch_notes") && <PreviewBadge />}
      />
      {shouldMovePatchMark(newest, seen) && <PatchMarkMover shown={newest} />}
    </PatchNotesFrame>
  );
}
