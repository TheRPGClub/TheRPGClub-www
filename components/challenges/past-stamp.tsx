import type { StampView } from "@/lib/challenges/profile-runs";
import type { RunStatus } from "@/lib/challenges/types";
import { cn } from "@/lib/utils";
import { StampFrame, StampTitle } from "@/components/challenges/run-stamp";
import { DeleteRunButton } from "@/components/challenges/delete-run-button";

type Outcome = Exclude<RunStatus, "active">;

// The inner panel by outcome: a Finished Run in its solid tint with paper
// type; an Expired one muted into ink-3; an Abandoned one plain ink-3.
const PANEL: Record<Outcome, string> = {
  finished: "bg-(--challenge-tint) text-(--challenge-type)",
  expired: "bg-[color-mix(in_srgb,var(--challenge-tint)_30%,var(--color-muted))] text-dim-foreground",
  abandoned: "bg-muted text-faint-foreground",
};

// The postmark across the corner, in Anton at -12deg: ink on paper for a
// Finish, a paper outline for Expired, a mute outline for Abandoned.
const POSTMARK: Record<Outcome, string> = {
  finished: "bg-foreground/88 text-background",
  expired: "text-foreground",
  abandoned: "text-faint-foreground",
};

const WORD: Record<Outcome, string> = { finished: "Finished", expired: "Expired", abandoned: "Abandoned" };

// A past Run as a small portrait stamp on a paper perforated frame
// (surface brief challenges-profile-runs). On the member's own profile an
// Abandoned one carries a trash button on its top edge to delete it.
export function PastStamp({ stamp, canDelete = false }: { stamp: StampView; canDelete?: boolean }) {
  const outcome = stamp.status as Outcome;
  return (
    <div data-slot="past-stamp" data-variant={outcome} className="group/stamp relative">
      {canDelete && (
        <span className="absolute -top-2 right-1 z-20 bg-background transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/stamp:opacity-100 pointer-fine:group-focus-within/stamp:opacity-100">
          <DeleteRunButton runId={stamp.id} challengeName={stamp.name} />
        </span>
      )}
      <StampFrame stamp={stamp} edge="paper" className="aspect-[4/5]">
        <div data-slot="past-stamp-panel" className={cn("flex h-full flex-col px-3 pt-3 pb-2.5", PANEL[outcome])}>
          <p className="font-label text-[0.7rem] leading-none font-extrabold tracking-[0.1em]">{stamp.formatLine}</p>
          <StampTitle stamp={stamp} className="mt-2 mb-auto line-clamp-2 pb-2 text-[1.5rem] leading-[0.9]" />
          <p className="font-headline text-[2.5rem] leading-[0.8]">
            {stamp.cleared}
            <span className="text-[1.25rem] opacity-70"> / {stamp.target}</span>
            <span className="sr-only"> Cleared</span>
          </p>
          <p className="font-label mt-1.5 text-[0.75rem] leading-[1.3] font-bold tracking-[0.06em]">
            {stamp.outcomeLine}
          </p>
        </div>
      </StampFrame>
      <span
        aria-hidden
        data-slot="past-stamp-postmark"
        className={cn(
          "font-headline pointer-events-none absolute -right-1.5 bottom-[44px] z-10 rounded-[3px] px-2 pt-[5px] pb-[3px] text-[1rem] leading-none shadow-[inset_0_0_0_3px_currentColor] sm:text-[1.3rem]",
          POSTMARK[outcome],
        )}
      >
        {WORD[outcome]}
      </span>
    </div>
  );
}
