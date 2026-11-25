"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createFranchiseAction } from "@/app/actions/franchises";
import { Button } from "@/components/ui/button";
import { NameDialog } from "@/components/franchises/name-dialog";

// New Franchise on the index's head (Regulars and above): names it, then
// opens its page to link its games.
export function NewFranchiseButton() {
  const router = useRouter();
  return (
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
      <Plus data-icon="inline-start" />
      New Franchise
    </NameDialog>
  );
}
