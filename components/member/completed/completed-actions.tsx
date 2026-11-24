import { Download, GitCompareArrows } from "lucide-react";
import type { CompletedPage } from "@/lib/members/completed-page";
import { ButtonLink } from "@/components/ui/button";
import { ImportLink } from "@/components/member/lists/import-link";
import { CompletionAddButton } from "@/components/member/manage/completion-add-button";

// The completed list's actions: compare with someone else's, and on your own
// export the list, import more and log a completion (spec api#451).
export function CompletedActions({
  userId,
  viewer,
  canLog = false,
}: {
  userId: string;
  viewer: CompletedPage["viewer"];
  // The owner's Log a completion (inside the page's ShelfManageProvider).
  canLog?: boolean;
}) {
  return (
    <>
      {viewer.signedIn && !viewer.isSelf && (
        <ButtonLink
          href={`/members/${userId}/completed-games/compare`}
          variant="outline"
        >
          <GitCompareArrows data-icon="inline-start" /> Compare
        </ButtonLink>
      )}
      {viewer.isSelf && (
        // A plain link, not next/link: the route handler answers with an
        // attachment, so the browser downloads it instead of navigating.
        <ButtonLink
          render={<a />}
          href={`/api/members/${userId}/completions/export`}
          download="completions.csv"
          variant="outline"
        >
          <Download data-icon="inline-start" /> Export CSV
        </ButtonLink>
      )}
      {viewer.canImport && <ImportLink userId={userId} />}
      {canLog && <CompletionAddButton />}
    </>
  );
}
