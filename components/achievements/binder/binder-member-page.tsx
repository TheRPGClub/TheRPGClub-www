import Link from "next/link";
import { Link2 } from "lucide-react";
import type { MemberAchievementSummary } from "@/lib/api/types";
import { linkedAccountsEditHref } from "@/lib/achievements";
import { binderNameSize } from "@/lib/member-achievements";
import { MemberAvatar } from "@/components/issue/member-cover";
import { cn } from "@/lib/utils";
import { BinderTotals, LinkedAccountChips } from "../member-binder";
import { RarestUnlocks } from "../rarest-unlocks";

const NAME_SIZE = {
  xl: "text-[6rem] sm:text-[7.75rem]",
  lg: "text-[4.25rem] sm:text-[5.5rem]",
  md: "text-[3rem] sm:text-[3.75rem]",
  sm: "text-[2.25rem] sm:text-[2.75rem]",
  xs: "text-[2rem] sm:text-[2.25rem]",
} as const;

// The binder's left page: who the member is, their totals, Linked
// Accounts and four rarest Unlocks.
export function BinderMemberPage({
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
      className="rounded-md bg-card px-5 pt-5 pb-4 sm:px-7 sm:pt-6 xl:shadow-[inset_-18px_0_22px_-14px_rgb(0_0_0/0.7)]"
    >
      <div className="flex flex-col gap-6 xl:sticky xl:top-[5.5rem]">
        <div className="flex items-start justify-between gap-4 border-b-2 border-foreground pb-4">
          <h1
            id="binder-member"
            className={cn(
              "font-headline min-w-0 pt-1 leading-[0.82] tracking-[0.01em] break-words text-foreground",
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
              className="font-label inline-flex items-center gap-1.5 text-[0.82rem] text-dim-foreground transition-colors hover:text-highlight [&_svg]:size-4"
            >
              <Link2 aria-hidden /> Manage Linked Accounts
            </Link>
          )}
        </div>

        {summary.rarest_unlocks.length > 0 && (
          <div className="border-t border-border pt-3">
            <h2 className="font-label text-[0.78rem] tracking-[0.1em] text-faint-foreground">
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
