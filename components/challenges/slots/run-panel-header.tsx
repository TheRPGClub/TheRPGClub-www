import { cn } from "@/lib/utils";
import { MemberMark } from "@/components/challenges/host-badge";
import { MemberLink } from "@/components/member/member-link";

// The top of a Run panel (surface brief challenges-slots): whose Run and
// from which year, the score in Anton (the target muted), the summary line
// or the stamp (Caught Up or Finished in the tint's hi, Abandoned muted), and
// the actions at the right (full width under the score on phones).
export function RunPanelHeader({
  title,
  note,
  member,
  score,
  line,
  stamp,
  actions,
}: {
  // "Your Run · from 1988", or the member's "Dice Goblin's Run".
  title: string;
  // "from 1994 · started 3 Mar 2025" under another member's name.
  note?: string;
  member?: { name: string; avatarUrl: string | null; userId: string };
  score?: { cleared: number; target: number };
  line?: string;
  stamp?: string | null;
  actions?: React.ReactNode;
}) {
  const hiStamp = stamp === "Caught Up" || stamp === "Finished";
  const scoreLine = score && (
    <p className="font-headline text-[3.4rem] leading-[0.8] sm:text-[4.5rem]">
      {score.cleared}
      <span className="text-[1.7rem] text-faint-foreground sm:text-[2.25rem]"> / {score.target}</span>
      <span className="sr-only"> Cleared</span>
    </p>
  );
  return (
    <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-3">
      {member && (
        <MemberLink userId={member.userId} className="self-center">
          <MemberMark name={member.name} src={member.avatarUrl} size={56} />
        </MemberLink>
      )}
      <div className="min-w-0">
        {member ? (
          <>
            <h2 className="font-headline text-[1.6rem] leading-[0.9] break-words sm:text-[1.875rem]">{title}</h2>
            {note && <p className="font-label mt-1 text-[0.8rem] tracking-[0.08em] text-faint-foreground">{note}</p>}
          </>
        ) : (
          <>
            <h2 className="font-label mb-1.5 text-[0.8rem] tracking-[0.08em] text-faint-foreground">{title}</h2>
            {scoreLine}
          </>
        )}
      </div>
      {member && scoreLine}
      {stamp && (
        <span
          data-slot="run-panel-stamp"
          className={cn(
            "font-headline inline-block self-center rounded-xs px-2.5 pt-1.5 pb-1 text-[1.375rem] leading-none whitespace-nowrap uppercase shadow-[inset_0_0_0_2px_currentColor]",
            hiStamp ? "text-(--challenge-tint-hi)" : "text-faint-foreground",
          )}
        >
          {stamp}
        </span>
      )}
      {line && (
        <span className="font-label mb-1.5 text-[0.8rem] tracking-[0.08em] text-dim-foreground">{line}</span>
      )}
      {actions && <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto *:max-sm:flex-1">{actions}</div>}
    </div>
  );
}
