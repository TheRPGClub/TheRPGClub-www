import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MemberAchievementSummary } from "@/lib/api/types";
import { memberAchievementsHref } from "@/lib/achievements";
import {
  SectionHeading,
  headingLinkClass,
} from "@/components/issue/page-header";
import { AchievementTotalsRow, LinkedAccountBadges } from "./achievement-totals";
import { UnlockList } from "./unlock-list";

// The Achievements department on a member's profile: their totals, Linked
// Accounts and five latest Unlocks, with a link to the full page. Rendered
// only when the summary read answers 200 (the member has a Linked Account).
export function MemberAchievementsSection({
  summary,
}: {
  summary: MemberAchievementSummary;
}) {
  const userId = summary.user.user_id;
  const href = memberAchievementsHref(userId);
  const linked = summary.linked_accounts.map((a) => a.provider);

  return (
    <section aria-labelledby="achievements" className="space-y-5">
      <SectionHeading
        title={<span id="achievements">Achievements</span>}
        count={summary.totals.unlocks}
        action={
          <Link href={href} className={headingLinkClass}>
            See all
            <ArrowRight aria-hidden />
          </Link>
        }
      />
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          <AchievementTotalsRow totals={summary.totals} linked={linked} />
          <LinkedAccountBadges accounts={summary.linked_accounts} />
        </div>
        {summary.latest_unlocks.length > 0 ? (
          <UnlockList
            unlocks={summary.latest_unlocks}
            userId={userId}
            compact
            className="-my-3"
          />
        ) : (
          <p className="self-start rounded-sm border border-dashed border-rule-strong px-4 py-6 text-sm text-paper-mute">
            No Unlocks synced yet.
          </p>
        )}
      </div>
    </section>
  );
}
