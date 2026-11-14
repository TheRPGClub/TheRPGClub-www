import { Download, GitCompareArrows } from "lucide-react";
import type { CompletedPage } from "@/lib/members/completed-page";
import { ButtonLink } from "@/components/ui/button";
import { ImportLink } from "@/components/member/lists/import-link";

// The completed list's actions: compare with someone else's, and on your own
// export the list and import more.
export function CompletedActions({
  userId,
  viewer,
}: {
  userId: string;
  viewer: CompletedPage["viewer"];
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
    </>
  );
}
