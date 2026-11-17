import type { ChallengePage } from "@/lib/challenges/challenge-page";
import { filterWall, poolWall, type PlayedFilter } from "@/lib/challenges/pool-wall";
import { tintStyle } from "@/lib/challenges/tint";
import { ChallengeBanner } from "@/components/challenges/challenge-banner";
import { ChallengeRules } from "@/components/challenges/challenge-rules";
import { ViewSwitch, type ChallengeViewKey } from "@/components/challenges/view-switch";
import { RunCards } from "@/components/challenges/pool/run-cards";
import { PoolWall } from "@/components/challenges/pool/pool-wall";
import { RunNoticeProvider, RunNoticeSlot } from "@/components/challenges/run-notice";

// A Pool Challenge's page (surface brief challenges-pool, 2B + 2D): the
// banner, the rules row, then the switch between every member's Runs and The
// Pool. Slots and Assignment Challenges get their own views (www#109,
// www#110); until then they show the Runs.
export function ChallengeView({
  page,
  view,
  played,
  showAll,
  badge,
  tools,
  notice,
  runAction,
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
}) {
  const { challenge, pool, runs } = page;
  const hasPool = challenge.challenge_format === "pool" && pool !== null;
  const current = hasPool ? view : "runs";
  const base = `/challenges/${challenge.id}?view=pool`;
  const hrefFor = ({ played: p, all }: { played?: PlayedFilter; all?: boolean }) =>
    `${base}${p && p !== "all" ? `&played=${p}` : ""}${all ? "&all=1" : ""}`;
  const added = new Set((challenge.pool?.included_games ?? []).map((g) => g.game_id));
  const tiles = hasPool ? poolWall(pool.games, runs ?? [], added) : [];
  return (
    <div style={tintStyle(page.tint)} className="pb-12">
      <ChallengeBanner page={page} badge={badge} />
      {notice}
      <ChallengeRules page={page} tools={tools} />
      <RunNoticeProvider>
        <ViewSwitch
          challengeId={challenge.id}
          current={current}
          views={[
            { key: "runs", label: "Runs", count: runs?.length ?? null },
            ...(hasPool ? [{ key: "pool" as const, label: "The Pool", count: pool.total }] : []),
          ]}
          action={runAction}
        />
        <RunNoticeSlot className="mt-2 mb-7 max-w-md" />
        {current === "pool" && hasPool ? (
          <PoolWall
            tiles={tiles}
            filter={played}
            showAll={showAll || filterWall(tiles, played).length <= 40}
            hrefFor={hrefFor}
            leftOut={(challenge.pool?.excluded_games ?? []).map((g) => g.title)}
          />
        ) : (
          <RunCards runs={runs} emptyAction={page.runAction.kind === "start" ? runAction : null} />
        )}
      </RunNoticeProvider>
    </div>
  );
}
