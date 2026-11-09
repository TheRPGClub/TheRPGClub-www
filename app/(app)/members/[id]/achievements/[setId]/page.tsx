import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { AchievementSetDetail, ApiSingle } from "@/lib/api/types";
import {
  PROVIDER_LABEL,
  memberName,
  setTitle,
  viewFromSetAchievement,
} from "@/lib/achievements";
import {
  headlineAchievement,
  parseSetPageView,
  slotted,
} from "@/lib/achievements/set-page";
import { getSetTint } from "@/lib/achievements/tint";
import { setDetailPath } from "@/lib/member-achievements";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import { AchievementList } from "@/components/achievements/achievement-list";
import { SetHeader } from "@/components/achievements/set-page/set-header";
import { SetSpread } from "@/components/achievements/set-page/set-spread";
import { SectionHeading } from "@/components/issue/page-header";

// One Achievement Set through a member's eyes, as a two-page spread in the
// member's binder: the masthead (title on the game tint, the monumental
// earned / total, the last Unlock), then the spread with its three views,
// CHECKLIST (default), RARITY and TIMELINE, picked with `?view=`. Hidden
// Achievements stay blurred until the viewer has unlocked them. Removed
// Achievements the member unlocked close the page.

export default async function MemberAchievementSetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; setId: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const [{ id, setId }, query] = await Promise.all([params, searchParams]);
  if (!/^\d+$/.test(setId)) notFound();
  const view = parseSetPageView(query.view);

  const [session, summary, res] = await Promise.all([
    getSession(),
    fetchAchievementSummary(id),
    apiFetch(setDetailPath(setId, id), { cache: "no-store" }),
  ]);
  // The hub is opt-in: like the achievements page, a member with no Linked
  // Account has no set pages, except for the member themselves.
  if (summary.status === "none" && session?.principal.discord_id !== id) {
    notFound();
  }
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Achievement Set ${setId} failed to load (${res.status})`);
  const { data: set }: ApiSingle<AchievementSetDetail> = await res.json();

  const displayName = set.user ? memberName(set.user) : id;
  const items = slotted(set.achievements.map((a) => viewFromSetAchievement(a, set.provider)));
  const removed = set.removed_achievements.map((a) =>
    viewFromSetAchievement(a, set.provider),
  );
  const headline = headlineAchievement(items, set.provider);
  const tint = await getSetTint({
    coverUrl: set.game?.cover_url,
    iconUrl: set.icon_url,
    setId: set.id,
  });

  return (
    <div className="flex w-full flex-col gap-8">
      <SetHeader set={set} tint={tint} userId={id} displayName={displayName} />

      {items.length > 0 ? (
        <SetSpread
          view={view}
          basePath={`/members/${id}/achievements/${setId}`}
          items={items}
          tint={tint}
          title={setTitle(set)}
          providerLabel={PROVIDER_LABEL[set.provider]}
          memberName={displayName}
          headline={headline ? { id: headline.item.view.id, reason: headline.reason } : null}
        />
      ) : (
        <p className="rounded-md border border-dashed border-rule-strong px-5 py-6 text-paper-mute">
          The Provider lists no Achievements for this set yet.
        </p>
      )}

      {removed.length > 0 && (
        <section aria-labelledby="set-removed" className="space-y-4">
          <SectionHeading
            title={<span id="set-removed">Removed</span>}
            count={`${removed.length} no longer in the set`}
          />
          <AchievementList items={removed} label="Removed achievements" />
        </section>
      )}
    </div>
  );
}
