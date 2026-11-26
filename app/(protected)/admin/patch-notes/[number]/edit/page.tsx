import { notFound } from "next/navigation";

import { siteUrl } from "@/lib/api/codex-write";
import { fetchPatchPendingChanges } from "@/lib/api/pending-changes";
import { fetchStaffPatch } from "@/lib/api/patch-write";
import { requirePatchEditor } from "@/lib/patch-notes/editor-access";
import { patchValue } from "@/lib/patch-notes/patch-schema";
import { patchNumberParam } from "@/lib/patch-notes/paths";
import { emptyRichTextValue } from "@/lib/rich-text/text";
import { PatchEditor } from "@/components/admin/patch-notes/patch-editor";

export async function generateMetadata({ params }: PageProps<"/admin/patch-notes/[number]/edit">) {
  const number = patchNumberParam((await params).number);
  return { title: number ? `Patch ${number} · Patch Notes · Staff desk` : "Patch Notes · Staff desk" };
}

// /admin/patch-notes/:number/edit (www#237): one Patch in the two-step
// editor. Admins and up; everyone else, and an unknown number, get the 404.
export default async function PatchEditPage({ params }: PageProps<"/admin/patch-notes/[number]/edit">) {
  await requirePatchEditor();
  const number = patchNumberParam((await params).number);
  if (number === null) notFound();
  const [patch, origin, pendingChanges] = await Promise.all([
    fetchStaffPatch(number),
    siteUrl(),
    fetchPatchPendingChanges(number),
  ]);
  if (patch === "not_found") notFound();
  // A failed read is the error page's (its Try again), not a missing Patch.
  if (patch === null) throw new Error("Couldn't read this Patch");

  const value = patchValue(patch.rich_body);
  return (
    <PatchEditor
      key={patch.number}
      patch={patch}
      initialValue={value.length > 0 ? value : emptyRichTextValue()}
      siteUrl={origin}
      pendingChanges={pendingChanges}
    />
  );
}
