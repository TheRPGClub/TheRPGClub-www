import { notFound } from "next/navigation";
import { firstParam } from "@/lib/search-params";
import { loadCompletedPage } from "@/lib/members/completed-page";
import { pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { CompletedActions } from "@/components/member/completed/completed-actions";
import { CompletedView } from "@/components/member/completed/completed-view";
import { memberCounts, memberName } from "@/components/member/member-lists";

// Completed games, a year at a time, with a search across every year (see
// lib/members/completed-page.ts).

export default async function CompletedGamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const currentPage = pageNumber(firstParam(raw.page));
  const q = firstParam(raw.q)?.trim() ?? "";
  const yearParam = firstParam(raw.year)?.trim().toLowerCase() ?? "";

  const page = await loadCompletedPage(id, { page: currentPage, q, yearParam });
  if (!page) notFound();
  const displayName = memberName(page.user);

  return (
    <MemberListTemplate
      userId={id}
      displayName={displayName}
      title="Completed games"
      count={page.list.total}
      current="completed"
      counts={memberCounts(page.user)}
      action={<CompletedActions userId={id} viewer={page.viewer} />}
    >
      <CompletedView page={page} currentPage={currentPage} q={q} displayName={displayName} />

      {page.cappedAt !== null && (
        <p className="text-xs text-faint-foreground">
          The year dial covers the first {page.cappedAt} completions only; use
          All to reach the rest.
        </p>
      )}
    </MemberListTemplate>
  );
}
