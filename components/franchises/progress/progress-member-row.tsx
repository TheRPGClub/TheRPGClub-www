import Link from "next/link";
import { formatPlaytime, progressMemberAvatar, progressMemberName, rankMeter, standing, type RankedMember } from "@/lib/franchises/progress";
import type { FranchiseProgressMeter } from "@/lib/franchises/types";
import { cn } from "@/lib/utils";
import { MemberMark } from "@/components/challenges/host-badge";
import { ConqueredStamp } from "@/components/franchises/progress/conquered-stamp";

// The table's columns from `lg`: rank, member, stamp, the segmented bar,
// Everything, Spin-offs, Playtime. Below `lg`: rank, member and Playtime,
// with the bar on a second line.
export const MEMBER_GRID =
  "grid grid-cols-[26px_minmax(0,1fr)_72px] items-center gap-x-2.5 gap-y-1 lg:grid-cols-[34px_minmax(0,1.3fr)_150px_minmax(0,1.4fr)_90px_90px_90px] lg:gap-x-3.5 lg:gap-y-0";

// One member: a link that swaps the dials and the wall to theirs (the
// viewer's own row goes back to theirs).
export function MemberRow({
  ranked,
  franchiseId,
  you,
  selected,
}: {
  ranked: RankedMember;
  franchiseId: number;
  you: boolean;
  selected: boolean;
}) {
  const { member, rank } = ranked;
  const name = you ? "You" : progressMemberName(member.user);
  const bar = member.meters[rankMeter(member.meters)];
  const line = standing(member.meters, member.conquered_at);
  const href = you ? `/franchises/${franchiseId}?view=progress` : `/franchises/${franchiseId}?view=progress&member=${encodeURIComponent(member.user.user_id)}`;
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={selected || undefined}
        aria-label={`${name}: ${bar.done} of ${bar.total}${line ? `, ${line}` : ""}, ${formatPlaytime(member.meters.all.playtime_minutes)}`}
        className={cn(
          MEMBER_GRID,
          "-mx-1.5 rounded-sm border-b border-border px-1.5 py-[9px] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
          you && "bg-highlight/6",
          selected && "bg-muted shadow-[inset_0_0_0_1px_var(--color-highlight)]",
        )}
      >
        <span className={cn("font-headline text-right text-[1.2rem] leading-none lg:text-[1.4rem]", you ? "text-highlight" : "text-faint-foreground")}>
          {rank}
        </span>
        <span className="flex min-w-0 items-center gap-2.5 font-semibold">
          <MemberMark name={progressMemberName(member.user)} src={progressMemberAvatar(member.user)} size={28} />
          <span className="min-w-0">
            <span className="block truncate">{name}</span>
            {line && (
              <small className="font-label block text-[0.7rem] leading-[1.2] font-bold tracking-[0.07em] text-faint-foreground">{line}</small>
            )}
          </span>
        </span>
        <span className="hidden lg:block">
          {member.conquered_at && <ConqueredStamp size="sm" />}
        </span>
        <span className="col-start-2 col-end-4 row-start-2 flex items-center gap-2.5 lg:col-auto lg:row-auto">
          <Segments meter={bar} />
          <Count meter={bar} className="text-[1.2rem]" />
        </span>
        <Count meter={member.meters.all} className="hidden text-right text-[1.15rem] lg:block" />
        <Count meter={member.meters.spin_offs} className="hidden text-right text-[1.15rem] lg:block" />
        <span className="font-headline col-start-3 row-start-1 text-right text-[1.15rem] leading-none lg:col-auto lg:row-auto">
          {formatPlaytime(member.meters.all.playtime_minutes)}
        </span>
      </Link>
    </li>
  );
}

// One block per game, the done ones in paper; past 40 games the blocks
// would vanish, so it is one bar filled to the share done.
function Segments({ meter }: { meter: FranchiseProgressMeter }) {
  if (meter.total > 40) {
    return (
      <span aria-hidden className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-muted">
        <i className="bg-foreground" style={{ width: `${(meter.done / meter.total) * 100}%` }} />
      </span>
    );
  }
  return (
    <span aria-hidden className="flex h-2.5 min-w-0 flex-1 gap-0.5">
      {Array.from({ length: meter.total }, (_, i) => (
        <i key={i} className={cn("flex-1 rounded-[1px]", i < meter.done ? "bg-foreground" : "bg-muted")} />
      ))}
    </span>
  );
}

function Count({ meter, className }: { meter: FranchiseProgressMeter; className?: string }) {
  return (
    <b className={cn("font-headline leading-none font-normal whitespace-nowrap", className)}>
      {meter.done}
      <span className="text-[0.75em] text-faint-foreground">/{meter.total}</span>
    </b>
  );
}
