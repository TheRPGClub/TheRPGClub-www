import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { monthYear, progressMemberAvatar, progressMemberName } from "@/lib/franchises/progress";
import type { FranchiseProgressView } from "@/lib/franchises/types";
import { ButtonLink } from "@/components/ui/button";
import { MemberMark } from "@/components/challenges/host-badge";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ProgressDials } from "@/components/franchises/progress/progress-dials";
import { ProgressMembers } from "@/components/franchises/progress/progress-members";
import { ProgressWall } from "@/components/franchises/progress/progress-wall";

// The Progress tab (design pick 1E with 1E1, spec api#457): the dials, the
// cover wall, then the Members table. Pressing a member swaps the dials and
// the wall to theirs (`&member=`), under a "Viewing Rowan's progress · Back
// to yours" bar; the table stays and rings their row.
export function FranchiseProgressTab({ franchiseId, progress }: { franchiseId: number; progress: FranchiseProgressView }) {
  const { yours, theirs, members, preview } = progress;
  const shown = theirs ?? yours;
  const user = members.find((m) => m.user.user_id === shown.user_id)?.user;
  const real = user ? progressMemberName(user) : theirs ? "This member" : "You";
  const name = theirs ? real : "You";
  const avatar = user ? progressMemberAvatar(user) : null;

  return (
    <div data-slot="franchise-progress">
      {preview && <PreviewBadge className="mb-3" />}
      {theirs && (
        <div className="mb-3.5 flex items-center gap-2.5 rounded-[3px] bg-card px-3 py-2 text-[0.92rem] text-dim-foreground shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
          <MemberMark name={real} src={avatar} size={24} />
          <p className="min-w-0 truncate">
            <span className="hidden sm:inline">Viewing </span>
            <b className="font-semibold text-foreground">
              {name}
              <span className="hidden sm:inline">&rsquo;s</span>
            </b>
            <span className="hidden sm:inline">
              {" "}progress{theirs.conquered_at && `, Conquered ${monthYear(theirs.conquered_at)}`}
            </span>
          </p>
          <ButtonLink render={<Link href={`/franchises/${franchiseId}?view=progress`} scroll={false} />} variant="rail-link" size="bare" className="ml-auto items-center gap-1.5">
            <ArrowLeft aria-hidden className="size-3.5" />
            <span className="hidden sm:inline">Back to yours</span>
            <span className="sm:hidden">Yours</span>
          </ButtonLink>
        </div>
      )}
      <ProgressDials progress={shown} name={name} markName={real} markSrc={avatar} />
      <Legend />
      <ProgressWall key={shown.user_id} progress={shown} />
      <ProgressMembers franchiseId={franchiseId} members={members} viewerId={yours.user_id} selectedId={theirs?.user_id ?? null} />
    </div>
  );
}

// What the covers' greys mean. Desktop only; the phone has no room for it.
function Legend() {
  const item = (swatch: string, text: string) => (
    <span className="inline-flex items-center gap-1.5">
      <i aria-hidden className={`inline-block h-[18px] w-3.5 rounded-xs ${swatch}`} />
      {text}
    </span>
  );
  return (
    <p className="font-label mt-[18px] hidden gap-4 text-[0.74rem] leading-none font-bold tracking-[0.07em] text-faint-foreground sm:flex">
      {item("bg-foreground", "Game Completion")}
      {item("bg-faint-foreground", "Played, not finished")}
      {item("bg-muted shadow-[inset_0_0_0_1px_var(--color-border-strong)]", "Not played")}
    </p>
  );
}
