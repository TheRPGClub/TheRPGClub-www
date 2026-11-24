import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { optionalSourcesLine, type PlayedFilter } from "@/lib/challenges/pool-wall";
import { tintStyle } from "@/lib/challenges/tint";
import { ChallengeBanner } from "@/components/challenges/challenge-banner";
import { ChallengeRules } from "@/components/challenges/challenge-rules";
import { ViewSwitch, type ChallengeViewKey, type ChallengeViewTab } from "@/components/challenges/view-switch";
import { RunCards } from "@/components/challenges/pool/run-cards";
import { PoolWall } from "@/components/challenges/pool/pool-wall";
import { RunNoticeProvider, RunNoticeSlot } from "@/components/challenges/run-notice";
import { NoticeSlip } from "@/components/issue/notice-slip";

// A Pool Challenge's page (surface brief challenges-pool, 2B + 2D): the
// banner, the rules row, then the switch between every member's Runs and The
// Pool (Core and Optional walls, pick 9A). A Proposals view slots in as a
// third word when the page passes one (www#172). Slots and Assignment
// Challenges get their own views (www#109, www#110).
export function ChallengeView({
  page,
  view,
  played,
  showAll,
  badge,
  tools,
  notice,
  runAction,
  proposals,
}: {
  page: ChallengePage;
  view: ChallengeViewKey;
  played: PlayedFilter;
  showAll: boolean;
  badge?: React.ReactNode;
  // The Host's and staff's tools, above the fact list.
  tools?: React.ReactNode;
  // A notice slip for this page (the duplicate-name warning).
  notice?: React.ReactNode;
  // The viewer's Run action at the right of the switch (www#107).
  runAction?: React.ReactNode;
  // The Pool Proposals view (www#172): its tab on the switch (count and
  // the waiting badge) and what it shows.
  proposals?: Omit<ChallengeViewTab, "key" | "label"> & { panel: React.ReactNode };
}) {
  const { challenge, pool, runs } = page;
  const hasPool = challenge.challenge_format === "pool" && pool !== null;
  const current = !hasPool ? "runs" : view === "proposals" && !proposals ? "runs" : view;
  const base = `/challenges/${challenge.id}?view=pool`;
  const hrefFor = ({ played: p, all }: { played?: PlayedFilter; all?: boolean }) =>
    `${base}${p && p !== "all" ? `&played=${p}` : ""}${all ? "&all=1" : ""}`;
  const tiles = page.poolWall;
  const views: ChallengeViewTab[] = [
    { key: "runs", label: "Runs", count: runs?.length ?? null },
    ...(hasPool ? [{ key: "pool" as const, label: "The Pool", count: pool.total }] : []),
    ...(hasPool && proposals ? [{ key: "proposals" as const, label: "Proposals", count: proposals.count, badge: proposals.badge }] : []),
  ];
  return (
    <div style={tintStyle(page.tint)} className="pb-12">
      <ChallengeBanner page={page} badge={badge} />
      {notice}
      <ChallengeRules page={page} tools={tools} />
      <RunNoticeProvider>
        <ViewSwitch
          challengeId={challenge.id}
          current={current}
          views={views}
          action={runAction}
        />
        <RunNoticeSlot className="mt-2 mb-7 max-w-md" />
        {current === "proposals" && proposals ? (
          proposals.panel
        ) : current === "pool" && hasPool ? (
          tiles ? (
            <PoolWall
              tiles={tiles}
              filter={played}
              showAll={showAll}
              hrefFor={hrefFor}
              leftOut={(challenge.pool?.excluded_games ?? []).map((g) => g.title)}
              target={challenge.pool?.optional_target ?? 0}
              sources={optionalSourcesLine(challenge.pool)}
            />
          ) : (
            <NoticeSlip title="Not just now" role="status" className="max-w-xl">
              The Pool couldn&apos;t be read. Try again in a moment.
            </NoticeSlip>
          )
        ) : (
          <RunCards runs={runs} emptyAction={page.runAction.kind === "start" ? runAction : null} />
        )}
      </RunNoticeProvider>
    </div>
  );
}
