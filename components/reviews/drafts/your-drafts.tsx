import type { ReactNode } from "react";

import { PageHeader } from "@/components/templates/page-header";
import type { DraftsPage } from "@/lib/reviews/drafts-read";
import { draftCount } from "@/lib/reviews/drafts";
import { DraftsTray } from "./drafts-tray";

// The Your drafts page: "YOUR DRAFTS" on the rule with the count and the
// order, then the tray. A failed read says so rather than showing an empty
// tray, which would read as "you have none".
export function YourDrafts({
  read,
  badge,
  pagination,
}: {
  read: DraftsPage | null;
  badge?: ReactNode;
  pagination?: ReactNode;
}) {
  const total = read?.total ?? 0;
  return (
    <div className="space-y-[26px] pb-10">
      <PageHeader
        title="Your drafts"
        badge={badge || undefined}
        count={total > 0 ? `${draftCount(total)} · only you see these` : "only you see these"}
        actions={
          total > 0 && (
            <span className="font-label text-sm font-extrabold text-dim-foreground">Newest first</span>
          )
        }
      />
      {read === null ? (
        <p role="alert" className="rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-sm text-faint-foreground">
          Your drafts couldn&apos;t be loaded right now.
        </p>
      ) : (
        <DraftsTray drafts={read.drafts} now={read.now} />
      )}
      {pagination}
    </div>
  );
}
