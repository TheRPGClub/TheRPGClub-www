import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession, requireFeature } from "@/lib/session";
import { PreviewBadge } from "@/components/feature/preview-badge";
import type {
  AchievementProvider,
  AchievementSetProgress,
  AchievementSetsSort,
  AchievementSetsStatus,
  AchievementUnlock,
  ApiCollection,
  ApiSingle,
  MemberAchievementSummary,
  User,
} from "@/lib/api/types";
import { paginationOf } from "@/lib/api/pagination";
import {
  PROVIDER_LABEL,
  PROVIDER_SHORT_LABEL,
  linkedAccountsEditHref,
  memberName,
  memberSetHref,
} from "@/lib/achievements";
import { getSetTint } from "@/lib/achievements/tint";
import {
  SETS_PER_PAGE,
  SET_SORT_LABEL,
  SET_STATUS_LABEL,
  UNLOCKS_PER_PAGE,
  binderNameSize,
  memberAchievementsPageHref,
  parseMemberAchievementsQuery,
  providerToggle,
  setsApiQuery,
  type MemberAchievementsQuery,
} from "@/lib/member-achievements";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import type { RawSearchParams } from "@/lib/search-params";
import {
  BinderIndexRow,
  BinderRings,
  BinderTotals,
  LinkedAccountChips,
} from "@/components/achievements/member-binder";
import { PROVIDER_FILL } from "@/components/achievements/provider-badge";
import { RarestUnlocks } from "@/components/achievements/rarest-unlocks";
import { UnlockList } from "@/components/achievements/unlock-list";
import { MemberAvatar } from "@/components/issue/member-cover";
import { MemberListShell } from "@/components/member/member-list-shell";
import { MemberListEmpty } from "@/components/member/member-game-card";
import { ListPagination } from "@/components/list-pagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A member's achievements as an open binder. The left page is the member:
// their name, totals, Linked Accounts and four rarest Unlocks. The right page
// is the index, one row per Achievement Set with a game-tint tab past the
// binder's edge, or the flat list of Unlocks (`?tab=unlocks`). Filter tabs
// for the index (status and Provider) sit on the binder's top edge. On
// phones the binder is a single page: the member first, the index below.
// The hub is opt-in, so a member with no Linked Account has no page here,
// except for the member themselves, who is asked to link one.

interface Page<T> {
  items: T[];
  total: number;
  totalPages: number;
  failed: boolean;
}

async function fetchPage<T>(path: string): Promise<Page<T>> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return { items: [], total: 0, totalPages: 1, failed: true };
    const body: ApiCollection<T> = await res.json();
    const { total, totalPages } = paginationOf(body.meta, body.data.length);
    return { items: body.data, total, totalPages, failed: false };
  } catch {
    return { items: [], total: 0, totalPages: 1, failed: true };
  }
}

type HrefFor = (next: Parameters<typeof memberAchievementsPageHref>[2]) => string;

export default async function MemberAchievementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const features = await requireFeature("achievement_hub");
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
        feature="achievement_hub"
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
  const href: HrefFor = (next) => memberAchievementsPageHref(id, query, next);
  const sets = query.tab === "sets";

  const [setsPage, statusCounts, unlocksPage] = await Promise.all([
    sets
      ? fetchPage<AchievementSetProgress>(
          `/api/v1/users/${encodeURIComponent(id)}/achievements/sets?${setsApiQuery(query.filter, query.page)}`,
        )
      : null,
    sets ? fetchStatusCounts(id, query) : null,
    sets
      ? null
      : fetchPage<AchievementUnlock>(
          `/api/v1/users/${encodeURIComponent(id)}/achievements/unlocks?${new URLSearchParams(
            { per: String(UNLOCKS_PER_PAGE), page: String(query.page) },
          )}`,
        ),
  ]);

  const tints = setsPage
    ? await Promise.all(
        setsPage.items.map((row) =>
          getSetTint({
            iconUrl: row.achievement_set.icon_url,
            setId: row.achievement_set.id,
          }),
        ),
      )
    : [];
  const rows = setsPage?.items.length ?? 0;

  return (
    <div className="pt-2 pb-6">
      {sets && (
        <FilterTabs
          query={query}
          linked={linked}
          counts={statusCounts}
          href={href}
        />
      )}

      <div
        className={cn(
          "relative mr-4 flex flex-col gap-2 rounded-lg bg-rule p-2 shadow-[0_24px_60px_rgb(0_0_0/0.6)]",
          "xl:mr-12 xl:grid xl:grid-cols-[25rem_30px_minmax(0,1fr)] xl:gap-0 xl:p-2.5",
          !sets && "mt-6 xl:mt-8",
        )}
      >
        <MemberPage
          summary={summary}
          userId={id}
          displayName={displayName}
          isSelf={isSelf}
        />

        <BinderRings count={Math.min(12, Math.max(4, Math.ceil(rows / 2)))} />

        <section
          aria-labelledby="binder-view"
          className="rounded-md bg-ink-2 px-4 pt-4 pb-5 sm:px-6 xl:pr-6 xl:pl-6 xl:shadow-[inset_18px_0_22px_-14px_rgb(0_0_0/0.7)]"
        >
          <IndexHeader
            query={query}
            href={href}
            setCount={setsPage?.failed ? null : (setsPage?.total ?? null)}
            unlockCount={summary.totals.unlocks}
            badge={features.preview("achievement_hub") && <PreviewBadge />}
          />

          {setsPage ? (
            setsPage.failed ? (
              <PageNote>Couldn&apos;t load sets. Try again in a moment.</PageNote>
            ) : setsPage.items.length === 0 ? (
              <PageNote>
                {query.filter.provider || query.filter.status
                  ? "No sets match these filters."
                  : "No sets synced yet."}
              </PageNote>
            ) : (
              <ol aria-label="Achievement Sets">
                {setsPage.items.map((row, i) => (
                  <BinderIndexRow
                    key={row.id}
                    row={row}
                    number={(query.page - 1) * SETS_PER_PAGE + i + 1}
                    tint={tints[i]}
                    href={memberSetHref(id, row.achievement_set.id)}
                  />
                ))}
              </ol>
            )
          ) : unlocksPage?.failed ? (
            <PageNote>Couldn&apos;t load Unlocks. Try again in a moment.</PageNote>
          ) : !unlocksPage || unlocksPage.items.length === 0 ? (
            <PageNote>No Unlocks synced yet.</PageNote>
          ) : (
            <UnlockList unlocks={unlocksPage.items} userId={id} className="mt-1" />
          )}

          <div className="pt-5 empty:hidden">
            <ListPagination
              currentPage={query.page}
              totalPages={(setsPage ?? unlocksPage)?.totalPages ?? 1}
              buildHref={(p) => href({ page: p })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

// Every status's set count under the current Provider filter, for the tabs.
// Each is a one-row read of its meta; a failed one leaves its tab unnumbered.
async function fetchStatusCounts(
  userId: string,
  query: MemberAchievementsQuery,
): Promise<Record<"all" | AchievementSetsStatus, number | null>> {
  const count = async (status: AchievementSetsStatus | null) => {
    const ps = new URLSearchParams({ per: "1", page: "1" });
    if (query.filter.provider) ps.set("provider", query.filter.provider);
    if (status) ps.set("status", status);
    const page = await fetchPage<AchievementSetProgress>(
      `/api/v1/users/${encodeURIComponent(userId)}/achievements/sets?${ps}`,
    );
    return page.failed ? null : page.total;
  };
  const [all, in_progress, completed] = await Promise.all([
    count(null),
    count("in_progress"),
    count("completed"),
  ]);
  return { all, in_progress, completed };
}

const tabBase =
  "font-label inline-flex h-8 items-center gap-1.5 rounded-t-[4px] px-3 text-[0.82rem] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-highlight";

// The filter tabs on the binder's top edge: status, then one tab per Linked
// Account's Provider in its own colour. A Provider tab toggles. Sort lives
// in the index header.
function FilterTabs({
  query,
  linked,
  counts,
  href,
}: {
  query: MemberAchievementsQuery;
  linked: AchievementProvider[];
  counts: Record<"all" | AchievementSetsStatus, number | null> | null;
  href: HrefFor;
}) {
  const { filter } = query;
  // A Provider filter is only worth offering with two Linked Accounts, but
  // a filter already in the URL stays visible so it can be cleared.
  const providers = linked.length > 1 || filter.provider ? linked : [];
  const statuses: { key: "all" | AchievementSetsStatus; label: string; value: AchievementSetsStatus | null }[] = [
    { key: "all", label: "All", value: null },
    ...(Object.keys(SET_STATUS_LABEL) as AchievementSetsStatus[]).map((s) => ({
      key: s,
      label: SET_STATUS_LABEL[s],
      value: s,
    })),
  ];

  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-1 pr-4 xl:pl-[calc(25rem+2.5rem)]">
      <nav aria-label="Status">
        <ul className="flex items-end gap-1">
          {statuses.map((s) => {
            const on = filter.status === s.value;
            const n = counts?.[s.key];
            return (
              <li key={s.key}>
                <Link
                  href={href({ filter: { status: s.value } })}
                  aria-current={on ? "true" : undefined}
                  scroll={false}
                  className={cn(
                    tabBase,
                    on
                      ? "h-9 bg-ink-2 text-paper shadow-[inset_0_2px_0_var(--color-paper)]"
                      : "bg-ink-3 text-paper-dim shadow-[inset_0_1px_0_var(--color-rule-strong)] hover:text-highlight",
                  )}
                >
                  {s.label}
                  {n != null && <span className={on ? "text-paper" : "text-paper-mute"}>{n}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {providers.length > 0 && (
        <nav aria-label="Provider">
          <ul className="flex items-end gap-1">
            {providers.map((p) => {
              const on = filter.provider === p;
              const dim = filter.provider != null && !on;
              return (
                <li key={p}>
                  <Link
                    href={href({ filter: { provider: providerToggle(filter.provider, p) } })}
                    aria-current={on ? "true" : undefined}
                    aria-label={`${PROVIDER_LABEL[p]}${on ? " (clear filter)" : ""}`}
                    scroll={false}
                    className={cn(
                      tabBase,
                      PROVIDER_FILL[p],
                      "text-ink",
                      on && "h-9 shadow-[inset_0_2px_0_var(--color-paper)]",
                      dim && "h-7 hover:h-8",
                      "motion-safe:transition-[height]",
                    )}
                  >
                    {PROVIDER_SHORT_LABEL[p]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

// The right page's header: the two views (the index of sets, the Unlocks)
// on the paper rule, and the index's sort.
function IndexHeader({
  query,
  href,
  setCount,
  unlockCount,
  badge,
}: {
  query: MemberAchievementsQuery;
  href: HrefFor;
  setCount: number | null;
  unlockCount: number;
  // The staff "Preview" badge, beside the views.
  badge?: React.ReactNode;
}) {
  const views = [
    { key: "sets" as const, label: "Index", count: setCount, noun: ["set", "sets"] },
    { key: "unlocks" as const, label: "Unlocks", count: unlockCount, noun: ["Unlock", "Unlocks"] },
  ];
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-paper pb-2">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <nav aria-label="Achievement views" id="binder-view">
          <ul className="flex items-end gap-5">
            {views.map((v) => {
              const on = v.key === query.tab;
              return (
                <li key={v.key} className="flex items-end gap-2">
                  <Link
                    href={href({ tab: v.key })}
                    aria-current={on ? "page" : undefined}
                    scroll={false}
                    className={cn(
                      "font-headline leading-[0.85] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                      on
                        ? "text-[2rem] text-paper sm:text-[2.2rem]"
                        : "text-[1.35rem] text-paper-mute hover:text-highlight",
                    )}
                  >
                    {v.label}
                  </Link>
                  {on && v.count != null && (
                    <span className="font-label pb-0.5 text-[0.8rem] text-paper-mute">
                      {v.count.toLocaleString("en-US")}{" "}
                      {v.count === 1 ? v.noun[0] : v.noun[1]}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {badge && <div className="pb-0.5">{badge}</div>}
      </div>
      {query.tab === "sets" && (
        <nav aria-label="Sort" className="flex items-center gap-2.5 pb-0.5">
          <span className="font-label text-[0.78rem] tracking-[0.08em] text-paper-mute">Sort</span>
          <ul className="flex items-center gap-0.5">
            {(Object.keys(SET_SORT_LABEL) as AchievementSetsSort[]).map((s) => {
              const on = query.filter.sort === s;
              return (
                <li key={s}>
                  <Link
                    href={href({ filter: { sort: s } })}
                    aria-current={on ? "true" : undefined}
                    scroll={false}
                    className={cn(
                      "font-label inline-flex h-6 items-center rounded-xs px-1.5 text-[0.8rem] transition-colors focus-visible:outline-2 focus-visible:outline-highlight",
                      on ? "bg-paper text-ink" : "text-paper-dim hover:text-highlight",
                    )}
                  >
                    {SET_SORT_LABEL[s]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

const NAME_SIZE = {
  xl: "text-[6rem] sm:text-[7.75rem]",
  lg: "text-[4.25rem] sm:text-[5.5rem]",
  md: "text-[3rem] sm:text-[3.75rem]",
  sm: "text-[2.25rem] sm:text-[2.75rem]",
  xs: "text-[2rem] sm:text-[2.25rem]",
} as const;

// The binder's left page: who the member is, their totals, Linked
// Accounts and four rarest Unlocks.
function MemberPage({
  summary,
  userId,
  displayName,
  isSelf,
}: {
  summary: MemberAchievementSummary;
  userId: string;
  displayName: string;
  isSelf: boolean;
}) {
  const linked = summary.linked_accounts.map((a) => a.provider);
  return (
    <section
      aria-labelledby="binder-member"
      className="rounded-md bg-ink-2 px-5 pt-5 pb-4 sm:px-7 sm:pt-6 xl:shadow-[inset_-18px_0_22px_-14px_rgb(0_0_0/0.7)]"
    >
      <div className="flex flex-col gap-6 xl:sticky xl:top-[5.5rem]">
        <div className="flex items-start justify-between gap-4 border-b-2 border-paper pb-4">
          <h1
            id="binder-member"
            className={cn(
              "font-headline min-w-0 pt-1 leading-[0.82] tracking-[0.01em] break-words text-paper",
              NAME_SIZE[binderNameSize(displayName)],
            )}
          >
            {displayName}
          </h1>
          <Link
            href={`/members/${userId}`}
            aria-label={`${displayName}'s profile`}
            className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
          >
            <MemberAvatar
              userId={userId}
              name={displayName}
              className="size-12 shadow-[0_12px_30px_rgb(0_0_0/0.5)] sm:size-14"
              fallbackClassName="text-2xl"
            />
          </Link>
        </div>

        <BinderTotals totals={summary.totals} linked={linked} />

        <div className="flex flex-col items-start gap-3">
          <LinkedAccountChips accounts={summary.linked_accounts} />
          {isSelf && (
            <Link
              href={linkedAccountsEditHref(userId)}
              className="font-label inline-flex items-center gap-1.5 text-[0.82rem] text-paper-dim transition-colors hover:text-highlight [&_svg]:size-4"
            >
              <Link2 aria-hidden /> Manage Linked Accounts
            </Link>
          )}
        </div>

        {summary.rarest_unlocks.length > 0 && (
          <div className="border-t border-rule pt-3">
            <h2 className="font-label text-[0.78rem] tracking-[0.1em] text-paper-mute">
              Rarest Unlocks
            </h2>
            <RarestUnlocks
              unlocks={summary.rarest_unlocks}
              userId={userId}
              className="mt-4"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function PageNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-sm border border-dashed border-rule-strong px-4 py-6 text-sm text-paper-mute">
      {children}
    </p>
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
