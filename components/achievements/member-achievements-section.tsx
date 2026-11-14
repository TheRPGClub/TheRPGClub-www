import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MemberAchievementSummary } from "@/lib/api/types";
import { memberAchievementsHref } from "@/lib/achievements";
import {
  SectionHeading,
  headingLinkClass,
} from "@/components/templates/page-header";
import { BinderTotals, LinkedAccountChips } from "./member-binder";
import { RarestUnlocks } from "./rarest-unlocks";

// The Achievements department on a member's profile, built from the
// binder's pieces: their totals and Linked Accounts on one side, their four
// rarest Unlocks on the other, and a link into the binder. Rendered only
// when the summary read answers 200 (the member has a Linked Account).
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
      <div className="grid gap-x-12 gap-y-7 rounded-md bg-ink-2 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8 lg:flex-col lg:items-start lg:justify-start">
          <BinderTotals totals={summary.totals} linked={linked} className="w-full max-w-[24rem]" />
          <LinkedAccountChips accounts={summary.linked_accounts} className="flex-row flex-wrap" />
        </div>
        <div className="flex flex-col gap-3 lg:border-l lg:border-rule lg:pl-10">
          <h3 className="font-label text-[0.78rem] tracking-[0.1em] text-paper-mute">
            Rarest Unlocks
          </h3>
          {summary.rarest_unlocks.length > 0 ? (
            <RarestUnlocks
              unlocks={summary.rarest_unlocks}
              userId={userId}
              className="max-w-[26rem]"
            />
          ) : (
            <p className="rounded-sm border border-dashed border-rule-strong px-4 py-6 text-sm text-paper-mute">
              No Unlocks synced yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
