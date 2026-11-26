import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchPatch, fetchPatches } from "@/lib/api/patches";
import { featureView } from "@/lib/features";
import { patchTitle } from "@/lib/patch-notes/format";
import { patchNumberParam, patchPath } from "@/lib/patch-notes/paths";
import { getSession } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { PatchNotesFrame } from "@/components/patch-notes/patch-notes-frame";
import { PatchPage } from "@/components/patch-notes/patch-page";

// One Patch in full (www#236): the cover band, the counts beside the text,
// and the previous and next Patches at the foot. Public, as /patch-notes.
// A draft, an unknown number and a hidden Feature are all not found.

export async function generateMetadata({ params }: PageProps<"/patch-notes/[number]">): Promise<Metadata> {
  const number = patchNumberParam((await params).number);
  return { title: number ? `Patch ${number} · Patch Notes · The RPG Club` : "Patch Notes · The RPG Club" };
}

export default async function PatchNotesPatchPage({ params }: PageProps<"/patch-notes/[number]">) {
  const number = patchNumberParam((await params).number);
  if (number === null) notFound();
  const session = await getSession();
  const features = featureView(session?.features);
  if (session && !features.canOpen("patch_notes")) notFound();
  // The list names the previous and next Patches at the foot.
  const [patch, patches] = await Promise.all([fetchPatch(number), fetchPatches()]);
  if (patch === "not_found") notFound();
  // A failed read is the error page's (its Try again), not a missing Patch.
  if (patch === null) throw new Error("Couldn't read this Patch");
  const titles = new Map(Array.isArray(patches) ? patches.map((p) => [p.number, patchTitle(p)] as const) : []);

  return (
    <PatchNotesFrame session={session} path={patchPath(number)}>
      <PatchPage patch={patch} titles={titles} badge={features.preview("patch_notes") && <PreviewBadge />} />
    </PatchNotesFrame>
  );
}
