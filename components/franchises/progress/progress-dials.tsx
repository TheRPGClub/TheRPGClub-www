import { formatPlaytime, monthYear, standing } from "@/lib/franchises/progress";
import type { FranchiseProgress } from "@/lib/franchises/types";
import { MemberMark } from "@/components/challenges/host-badge";
import { ConqueredStamp } from "@/components/franchises/progress/conquered-stamp";
import { ProgressDial } from "@/components/franchises/progress/progress-dial";

// The top of the Progress tab (pick 1E): the three dials, ruled apart, then
// who they belong to and their Playtime across the Franchise. From `lg` the
// side sits as a fourth column; below it, as a row under the dials. A
// Conquest presses the stamp onto the Mainline dial.
export function ProgressDials({
  progress,
  name,
  markName,
  markSrc = null,
}: {
  progress: FranchiseProgress;
  name: string;
  markName: string;
  // Their avatar, when the members table has them; else the initials.
  markSrc?: string | null;
}) {
  const { meters, conquered_at } = progress;
  const line = standing(meters, conquered_at) ?? "Nobody can Conquer it yet";
  const dial = "border-r border-border";
  return (
    <div className="grid grid-cols-3 items-end border-b border-border pb-5 lg:grid-cols-[repeat(3,minmax(0,1fr))_230px]">
      <div className={dial}>
        <ProgressDial
          meter={meters.mainline}
          label="Mainline"
          empty={{ text: "No Mainline games yet", note: "A Regular marks them with Edit Franchise" }}
          stamp={
            conquered_at && (
              <span className="absolute -top-1.5 right-1 origin-top-right scale-[0.62] lg:scale-100">
                <ConqueredStamp date={monthYear(conquered_at)} />
              </span>
            )
          }
        />
      </div>
      <div className={dial}>
        <ProgressDial
          meter={meters.all}
          label="Mainline + spin-offs"
          shortLabel="Everything"
          empty={{ text: "No games yet", note: "None linked" }}
        />
      </div>
      <div className="lg:border-r lg:border-border">
        <ProgressDial meter={meters.spin_offs} label="Spin-offs" empty={{ text: "No spin-offs yet", note: "None linked" }} />
      </div>
      <div className="col-span-full flex items-center justify-between gap-4 pt-3.5 lg:col-span-1 lg:flex-col lg:items-start lg:justify-end lg:gap-2.5 lg:self-stretch lg:pt-0 lg:pl-[22px]">
        <div className="flex min-w-0 items-center gap-2.5">
          <MemberMark name={markName} src={markSrc} size={34} />
          <div className="min-w-0">
            <p className="font-headline truncate text-[1.35rem] leading-[0.9] lg:text-[1.6rem]">{name}</p>
            <p className="font-label mt-[3px] text-[0.74rem] leading-[1.2] font-bold tracking-[0.08em] text-faint-foreground">{line}</p>
          </div>
        </div>
        <p className="font-headline shrink-0 text-right text-[2.2rem] leading-[0.85] lg:text-left lg:text-[2.6rem]">
          {formatPlaytime(meters.all.playtime_minutes)}
          <small className="font-label mt-1 block text-[0.68rem] leading-[1.2] font-bold tracking-[0.08em] text-faint-foreground lg:text-[0.74rem]">
            Playtime across the Franchise
          </small>
        </p>
      </div>
    </div>
  );
}
