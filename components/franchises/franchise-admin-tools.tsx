"use client";

import { useRouter } from "next/navigation";
import { PencilLine, Trash2 } from "lucide-react";
import { deleteFranchiseAction, renameFranchiseAction } from "@/app/actions/franchises";
import { Button } from "@/components/ui/button";
import { TypedConfirmButton } from "@/components/admin/desk/typed-confirm";
import { MergeDialog } from "@/components/franchises/merge-dialog";
import { NameDialog } from "@/components/franchises/name-dialog";

// The Admins' tools on the Franchise editor: Rename (kept through IGDB
// re-imports), Merge into another Franchise, and Delete with a typed
// confirm. Merge and Delete can't be undone.
export function FranchiseAdminTools({ franchise, games }: { franchise: { franchise_id: number; name: string }; games: number }) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Admin tools">
      <span className="font-label mr-1 text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">Admin</span>
      <NameDialog
        trigger={<Button variant="outline" size="sm" />}
        title="Rename Franchise"
        description="IGDB re-imports keep the new name."
        initial={franchise.name}
        submitLabel="Rename"
        pendingLabel="Renaming…"
        onSubmit={async (name) => {
          const result = await renameFranchiseAction(franchise.franchise_id, name);
          if (!result.ok) return result.error;
          router.refresh();
          return null;
        }}
      >
        <PencilLine data-icon="inline-start" />
        Rename
      </NameDialog>
      <MergeDialog franchise={franchise} games={games} />
      <TypedConfirmButton
        triggerLabel="Delete"
        triggerIcon={Trash2}
        question={`Delete ${franchise.name}?`}
        words={`delete ${franchise.name}`}
        actionLabel="Delete Franchise"
        actionIcon={Trash2}
        onConfirm={async () => {
          const result = await deleteFranchiseAction(franchise.franchise_id);
          if (!result.ok) return { error: result.error };
          router.push("/franchises");
        }}
      >
        {games === 1 ? "Its 1 game stays" : `Its ${games} games stay`} in GameDB without this Franchise, and Pools built from
        it lose it as a source (their Core Games stay). IGDB won&apos;t bring it back, and a delete can&apos;t be undone.
      </TypedConfirmButton>
    </div>
  );
}
