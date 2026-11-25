import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession, requireFeature } from "@/lib/session";
import type { ApiSingle, User } from "@/lib/api/types";
import { memberName } from "@/lib/achievements";
import { parseMemberAchievementsQuery } from "@/lib/member-achievements";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import { fetchBinderPages } from "@/lib/member-achievements-binder";
import type { RawSearchParams } from "@/lib/search-params";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { BinderPage } from "@/components/achievements/binder/binder-page";
import { LinkAccountCta } from "@/components/achievements/binder/binder-notes";
import { MemberListTemplate } from "@/components/templates/member-list-template";
import { MemberListEmpty } from "@/components/member/member-game-card";

// A member's achievements as an open binder (`?tab=`, `?status=`,
// `?provider=`, `?sort=`, `?page=`). The hub is opt-in, so a member with no
// Linked Account has no page here, except for the member themselves, who
// is asked to link one.

export default async function MemberAchievementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const query = parseMemberAchievementsQuery(raw);
  // The binder's right page doesn't wait on the summary: both start at
  // once, and the pages are dropped when there's no summary to show.
  const [features, session, result, pages] = await Promise.all([
    requireFeature("achievement_hub"),
    getSession(),
    fetchAchievementSummary(id),
    fetchBinderPages(id, query),
  ]);

  const isSelf = session?.principal.discord_id === id;
  if (result.status === "none" && !isSelf) notFound();

  if (result.status !== "ok") {
    // Only here is the name read on its own: the summary carries it.
    const userRes = await apiFetch(`/api/v1/users/${id}`, { cache: "no-store" });
    if (!userRes.ok) notFound();
    const { data: user }: ApiSingle<User> = await userRes.json();
    const displayName = memberName(user);
    return (
      <MemberListTemplate
        userId={id}
        displayName={displayName}
        title="Achievements"
        feature="achievement_hub"
      >
        {result.status === "none" ? (
          <LinkAccountCta userId={id} />
        ) : (
          <MemberListEmpty>
            Couldn&apos;t load achievements. Try again in a moment.
          </MemberListEmpty>
        )}
      </MemberListTemplate>
    );
  }

  return (
    <BinderPage
      userId={id}
      displayName={memberName(result.summary.user)}
      isSelf={isSelf}
      summary={result.summary}
      query={query}
      pages={pages}
      badge={features.preview("achievement_hub") && <PreviewBadge />}
    />
  );
}
