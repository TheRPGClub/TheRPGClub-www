import { notFound } from "next/navigation";
import { firstParam } from "@/lib/search-params";
import { loadCompletedPage } from "@/lib/members/completed-page";
import { pageNumber } from "@/lib/members/member-page";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { CompletedActions } from "@/components/member/completed/completed-actions";
import { CompletedView } from "@/components/member/completed/completed-view";
import { memberCounts } from "@/lib/members/member-lists";
import { memberName } from "@/lib/achievements";
import { loadShelfOwner } from "@/lib/members/shelf-manage";
import { ShelfManageProvider } from "@/components/member/manage/shelf-manage-context";

// Completed games, a year at a time, with a search across every year (see
// lib/members/completed-page.ts). The owner manages the list here (spec
// api#451, pick 3A).

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

  const [page, owner] = await Promise.all([
    loadCompletedPage(id, { page: currentPage, q, yearParam }),
    loadShelfOwner(id),
  ]);
  if (!page) notFound();
  const displayName = memberName(page.user);

  return (
    <ShelfManageProvider
      owner={owner}
      kind="completed"
      listName="Completed"
      entries={owner ? page.list.entries : []}
    >
      <MemberListTemplate
        userId={id}
        displayName={displayName}
        title="Completed games"
        count={page.list.total}
        current="completed"
        counts={memberCounts(page.user)}
        action={
          <CompletedActions
            userId={id}
            viewer={page.viewer}
            canLog={owner !== null}
          />
        }
      >
        <CompletedView
          page={page}
          currentPage={currentPage}
          q={q}
          displayName={displayName}
          manage={owner !== null}
        />

        {page.cappedAt !== null && (
          <p className="text-xs text-faint-foreground">
            The year dial covers the first {page.cappedAt} completions only; use
            All to reach the rest.
          </p>
        )}
      </MemberListTemplate>
    </ShelfManageProvider>
  );
}
