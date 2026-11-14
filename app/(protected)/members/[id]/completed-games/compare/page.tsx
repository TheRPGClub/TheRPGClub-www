import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { parseCompareFilters } from "@/lib/completions-compare";
import { loadComparePage } from "@/lib/members/compare-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { CompareMemberForm } from "@/components/member/compare/compare-member-form";
import { CompareResults } from "@/components/member/compare/compare-results";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { memberCounts } from "@/components/member/member-lists";

// Compare completions: the overlap diagram ("only A / both / only B") over a
// contact sheet of the shared games (see lib/members/compare-page.ts).

export default async function CompareCompletionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, raw, session] = await Promise.all([params, searchParams, getSession()]);
  const filters = parseCompareFilters(raw, id, session?.principal.discord_id ?? null);
  const page = await loadComparePage(id, filters);
  if (!page) notFound();
  const { result, left } = page;
  const action = `/members/${id}/completed-games/compare`;

  return (
    <MemberListTemplate
      userId={id}
      displayName={left.name}
      title="Compare completions"
      counts={memberCounts(page.user)}
      current="completed"
    >
      <CompareMemberForm
        // Remount on navigation so the uncontrolled select picks up the URL.
        key={`member-${filters.with ?? ""}`}
        action={action}
        ownerName={left.name}
        filters={filters}
        members={page.members}
      />

      {result.kind === "none" && (
        <MemberListEmpty>
          Pick a member to see which games you&apos;ve both completed.
        </MemberListEmpty>
      )}
      {result.kind === "self" && (
        <MemberListEmpty>
          Pick someone other than {left.name} to compare with.
        </MemberListEmpty>
      )}
      {result.kind === "error" && <MemberListEmpty>{result.message}</MemberListEmpty>}

      {result.kind === "ok" && (
        <CompareResults
          result={result}
          overlap={page.overlap}
          filters={filters}
          platforms={page.platforms}
          action={action}
          left={left}
          right={page.right}
        />
      )}
    </MemberListTemplate>
  );
}
