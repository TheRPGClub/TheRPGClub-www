"use client";

import { useRouter } from "next/navigation";
import { Check, FolderPlus, Pencil, Plus } from "lucide-react";
import type { FranchiseLayout } from "@/lib/franchises/page";
import type { FranchisePage } from "@/lib/franchises/types";
import type { FranchiseEditor } from "@/hooks/use-franchise-editor";
import { createFranchiseAction } from "@/app/actions/franchises";
import { Button, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/templates/page-header";
import { NameDialog } from "@/components/franchises/name-dialog";

// The Franchise page's head: the way back to Games, the name in Anton with
// "Franchise" beside it, and its tally (Mainline, Spin-offs, Add-ons, where it
// came from). Regulars and above get New Franchise and Edit Franchise, which
// turns the Games view into the editor (Done editing ends it).
export function FranchiseHeader({
  page,
  counts,
  editor,
  canToggleEdit,
  canStartChallenge,
}: {
  page: FranchisePage;
  counts: FranchiseCounts;
  editor: FranchiseEditor;
  // Edit Franchise works on the Games view only.
  canToggleEdit: boolean;
  // "Start a Challenge from this Franchise" (www#172): its Mainline games
  // as Core, the Franchise as a source.
  canStartChallenge: boolean;
}) {
  const router = useRouter();
  const origin = page.igdb_franchise_id == null ? "Made by hand" : "From IGDB";
  const manual = counts.manual > 0 ? `, ${counts.manual} linked by hand` : "";
  return (
    <PageHeader
      back={{ href: "/games", label: "Games" }}
      title={page.name}
      count="Franchise"
      actions={
        (canStartChallenge || page.viewer.can_edit) && (
          <>
            {canStartChallenge && !editor.editing && (
              <ButtonLink href={`/challenges/new?franchise=${page.franchise_id}`} variant="outline">
                <Plus data-icon="inline-start" />
                Start a Challenge
              </ButtonLink>
            )}
            {page.viewer.can_edit && (
              <>
                <NameDialog
                  trigger={<Button variant="outline" />}
                  title="New Franchise"
                  description="A Franchise IGDB doesn't have. Link its games once it's made."
                  submitLabel="Create"
                  pendingLabel="Creating…"
                  onSubmit={async (name) => {
                    const result = await createFranchiseAction(name);
                    if (!result.ok) return result.error;
                    if (result.data) router.push(`/franchises/${result.data.franchise_id}`);
                    return null;
                  }}
                >
                  <FolderPlus data-icon="inline-start" />
                  New Franchise
                </NameDialog>
                {canToggleEdit &&
                  (editor.editing ? (
                    <Button variant="highlight" onClick={() => editor.setEditing(false)}>
                      <Check data-icon="inline-start" />
                      Done editing
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => editor.setEditing(true)}>
                      <Pencil data-icon="inline-start" />
                      Edit Franchise
                    </Button>
                  ))}
              </>
            )}
          </>
        )
      }
      description={
        <span className="font-label flex flex-wrap gap-x-4 gap-y-1.5 text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground">
          <span>
            <b className="text-foreground">{counts.mainline}</b> Mainline
          </span>
          <span>
            <b className="text-foreground">{counts.other}</b> Spin-offs
          </span>
          <span>
            <b className="text-foreground">{counts.addOns}</b> Add-ons
          </span>
          <span>
            {origin}
            {manual}
          </span>
        </span>
      }
    />
  );
}

type FranchiseCounts = FranchiseLayout["counts"];
