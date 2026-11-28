import type { ReactNode } from "react";
import { PageHeader } from "@/components/templates/page-header";

// The voting page between rounds.
export function NoRound({ badge }: { badge: ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Nominations & voting" badge={badge} />
      <p data-slot="issue-note" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
        No voting round is scheduled right now. Check back soon!
      </p>
    </div>
  );
}
