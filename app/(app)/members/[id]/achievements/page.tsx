import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type {
  AchievementProvider,
  AchievementSetProgress,
  AchievementSetsSort,
  AchievementSetsStatus,
  AchievementUnlock,
  ApiCollection,
  ApiSingle,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import {
  PROVIDER_SHORT_LABEL,
  linkedAccountsEditHref,
  memberName,
  memberSetHref,
} from "@/lib/achievements";
import {
  MEMBER_ACHIEVEMENTS_TABS,
  SET_SORT_LABEL,
  SET_STATUS_LABEL,
  UNLOCKS_PER_PAGE,
  memberAchievementsPageHref,
  parseMemberAchievementsQuery,
  setsApiQuery,
  type MemberAchievementsQuery,
} from "@/lib/member-achievements";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import type { RawSearchParams } from "@/lib/search-params";
import {
  AchievementTotalsRow,
  LinkedAccountBadges,
} from "@/components/achievements/achievement-totals";
import { SegmentedLinks } from "@/components/achievements/segmented-links";
import { SetProgressCard } from "@/components/achievements/set-progress-card";
import { UnlockList } from "@/components/achievements/unlock-list";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { ListPagination } from "@/components/list-pagination";
import { buttonVariants } from "@/components/ui/button";

// A member's achievements: the totals and Linked Accounts up top, then two
// tabs. Sets is the progress grid (filtered by Provider and status, sorted
// by recent, progress or title); Unlocks is the flat list, newest first.
// The hub is opt-in, so a member with no Linked Account has no page here,
// except for the member themselves, who is asked to link one.

interface Page<T> {
  items: T[];
  totalPages: number;
  failed: boolean;
}

async function fetchPage<T>(path: string): Promise<Page<T>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return { items: [], totalPages: 1, failed: true };
    const body: ApiCollection<T> = await res.json();
    return {
      items: body.data,
      totalPages: paginationOf(body.meta, body.data.length).totalPages,
      failed: false,
    };
  } catch {
    return { items: [], totalPages: 1, failed: true };
  }
}

export default async function MemberAchievementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const query = parseMemberAchievementsQuery(raw);
  // The same read as the running head, so the request is shared.
  const userPath = `/api/v1/users/${id}`;

  const [session, userRes, result] = await Promise.all([
    getSession(),
    apiFetch(userPath, { cache: "no-store" }),
    fetchAchievementSummary(id),
  ]);

  const isSelf = session?.principal.discord_id === id;
  if (result.status === "none" && !isSelf) notFound();
  if (!userRes.ok) notFound();
  const { data: user }: ApiSingle<User> = await userRes.json();
  const displayName = memberName(user);

  if (result.status !== "ok") {
    return (
      <MemberListShell
        userId={id}
        displayName={displayName}
        title="Achievements"
      >
        {result.status === "none" ? (
          <LinkAccountCta userId={id} />
        ) : (
          <MemberListEmpty>
            Couldn&apos;t load achievements. Try again in a moment.
          </MemberListEmpty>
        )}
      </MemberListShell>
    );
  }

  const { summary } = result;
  const linked = summary.linked_accounts.map((a) => a.provider);
  const href = (next: Parameters<typeof memberAchievementsPageHref>[2]) =>
    memberAchievementsPageHref(id, query, next);

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title="Achievements"
      count={summary.totals.unlocks}
      countNoun={["unlock", "unlocks"]}
      action={
        isSelf && (
          <Link
            href={linkedAccountsEditHref(id)}
            className={buttonVariants({ variant: "outline" })}
          >
            <Link2 data-icon="inline-start" /> Linked Accounts
          </Link>
        )
      }
    >
      <div className="flex flex-col gap-5 pb-2 sm:flex-row sm:items-end sm:justify-between">
        <AchievementTotalsRow totals={summary.totals} linked={linked} />
        <LinkedAccountBadges accounts={summary.linked_accounts} />
      </div>

      <SegmentedLinks
        label="Achievement views"
        className="border-b border-rule pb-3"
        options={MEMBER_ACHIEVEMENTS_TABS.map((tab) => ({
          key: tab.key,
          label: tab.label,
          href: href({ tab: tab.key }),
          on: tab.key === query.tab,
        }))}
      />

      {query.tab === "sets" ? (
        <SetsTab userId={id} query={query} linked={linked} href={href} />
      ) : (
        <UnlocksTab userId={id} query={query} href={href} />
      )}
    </MemberListShell>
  );
}

function LinkAccountCta({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-rule-strong px-5 py-8 sm:px-7">
      <p className="font-headline text-3xl text-paper sm:text-4xl">
        No Linked Accounts yet
      </p>
      <p className="max-w-[52ch] text-paper-dim">
        Link your RetroAchievements, Steam or PSN account and the club mirrors
        your achievements here and on your profile. Only you see this page
        until you do.
      </p>
      <Link
        href={linkedAccountsEditHref(userId)}
        className={buttonVariants({ variant: "highlight" })}
      >
        <Link2 data-icon="inline-start" /> Link an account
      </Link>
    </div>
  );
}

type HrefFor = (next: Parameters<typeof memberAchievementsPageHref>[2]) => string;

async function SetsTab({
  userId,
  query,
  linked,
  href,
}: {
  userId: string;
  query: MemberAchievementsQuery;
  linked: AchievementProvider[];
  href: HrefFor;
}) {
  const { filter, page } = query;
  const sets = await fetchPage<AchievementSetProgress>(
    `/api/v1/users/${encodeURIComponent(userId)}/achievements/sets?${setsApiQuery(filter, page)}`,
  );
  const filtered = filter.provider != null || filter.status != null;
  // A Provider filter is only worth offering with two Linked Accounts, but
  // a filter already in the URL stays visible so it can be cleared.
  const providers = linked.length > 1 || filter.provider ? linked : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {providers.length > 0 && (
          <SegmentedLinks
            label="Provider"
            size="sm"
            options={[
              { key: "all", label: "All", href: href({ filter: { provider: null } }), on: filter.provider == null },
              ...providers.map((p) => ({
                key: p,
                label: PROVIDER_SHORT_LABEL[p],
                href: href({ filter: { provider: p } }),
                on: filter.provider === p,
              })),
            ]}
          />
        )}
        <SegmentedLinks
          label="Status"
          size="sm"
          options={[
            { key: "all", label: "All", href: href({ filter: { status: null } }), on: filter.status == null },
            ...(Object.keys(SET_STATUS_LABEL) as AchievementSetsStatus[]).map((s) => ({
              key: s,
              label: SET_STATUS_LABEL[s],
              href: href({ filter: { status: s } }),
              on: filter.status === s,
            })),
          ]}
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="font-label text-[0.85rem] tracking-[0.08em] text-paper-mute">
            Sort
          </span>
          <SegmentedLinks
            label="Sort"
            size="sm"
            options={(Object.keys(SET_SORT_LABEL) as AchievementSetsSort[]).map((s) => ({
              key: s,
              label: SET_SORT_LABEL[s],
              href: href({ filter: { sort: s } }),
              on: filter.sort === s,
            }))}
          />
        </div>
      </div>

      {sets.failed ? (
        <MemberListEmpty>
          Couldn&apos;t load sets. Try again in a moment.
        </MemberListEmpty>
      ) : sets.items.length === 0 ? (
        <MemberListEmpty>
          {filtered ? "No sets match these filters." : "No sets synced yet."}
        </MemberListEmpty>
      ) : (
        <ul aria-label="Achievement Sets" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {sets.items.map((row) => (
            <li key={row.id}>
              <SetProgressCard
                set={row.achievement_set}
                progress={row}
                href={memberSetHref(userId, row.achievement_set.id)}
                className="h-full"
              />
            </li>
          ))}
        </ul>
      )}

      <ListPagination
        currentPage={page}
        totalPages={sets.totalPages}
        buildHref={(p) => href({ page: p })}
      />
    </div>
  );
}

async function UnlocksTab({
  userId,
  query,
  href,
}: {
  userId: string;
  query: MemberAchievementsQuery;
  href: HrefFor;
}) {
  const ps = new URLSearchParams({
    per: String(UNLOCKS_PER_PAGE),
    page: String(query.page),
  });
  const unlocks = await fetchPage<AchievementUnlock>(
    `/api/v1/users/${encodeURIComponent(userId)}/achievements/unlocks?${ps}`,
  );

  return (
    <div className="space-y-6">
      {unlocks.failed ? (
        <MemberListEmpty>
          Couldn&apos;t load Unlocks. Try again in a moment.
        </MemberListEmpty>
      ) : unlocks.items.length === 0 ? (
        <MemberListEmpty>No Unlocks synced yet.</MemberListEmpty>
      ) : (
        <UnlockList unlocks={unlocks.items} userId={userId} className="-my-3" />
      )}
      <ListPagination
        currentPage={query.page}
        totalPages={unlocks.totalPages}
        buildHref={(p) => href({ page: p })}
      />
    </div>
  );
}
