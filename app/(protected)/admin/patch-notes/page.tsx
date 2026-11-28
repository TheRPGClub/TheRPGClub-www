import { fetchStaffPatches } from "@/lib/api/patch-write";
import { requirePatchEditor } from "@/lib/patch-notes/editor-access";
import { STAFF_DESK_BACK } from "@/lib/staff";
import { DeskHeader } from "@/components/templates/desk-header";
import { NewPatchButton } from "@/components/admin/patch-notes/new-patch-button";
import { PatchDeskList } from "@/components/admin/patch-notes/patch-desk-list";

export const metadata = { title: "Patch Notes · Staff desk" };

// /admin/patch-notes (www#237): every Patch, drafts first, and New Patch.
// Admins and up; everyone else gets the 404.
export default async function PatchEditorListPage() {
  await requirePatchEditor();
  const patches = await fetchStaffPatches();
  const drafts = patches?.filter((p) => p.status === "draft").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <DeskHeader
        back={STAFF_DESK_BACK}
        title="Patch Notes"
        side={
          patches && (
            <>
              <b>
                {patches.length} {patches.length === 1 ? "Patch" : "Patches"}
              </b>{" "}
              · {drafts} {drafts === 1 ? "draft" : "drafts"}
              <br />
              Only Admins see drafts
            </>
          )
        }
      />
      <NewPatchButton />
      {patches === null ? (
        <p data-slot="staff-alert" role="alert" className="text-destructive">
          {"Couldn't load the Patches. Refresh to try again."}
        </p>
      ) : (
        <PatchDeskList patches={patches} />
      )}
    </div>
  );
}
