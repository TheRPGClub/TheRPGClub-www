import type { ProposalView } from "@/lib/challenges/proposals";
import { InboxRow } from "@/components/challenges/proposals/inbox-row";
import { ProposeForm } from "@/components/challenges/proposals/propose-form";

// The Proposals view for members who don't decide (pick 9A): Propose a game,
// then their own proposals still waiting.
export function MemberProposals({
  challengeId,
  decider,
  proposals,
}: {
  challengeId: number;
  decider: string;
  proposals: ProposalView[] | null;
}) {
  return (
    <div className="grid gap-x-12 gap-y-9 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
      <ProposeForm challengeId={challengeId} decider={decider} />
      <section aria-labelledby="your-proposals-heading">
        <div className="flex flex-wrap items-center gap-x-3 border-b border-border-strong pb-2">
          <h3 id="your-proposals-heading" className="font-headline text-[1.75rem] leading-none">
            Your proposals
          </h3>
          {proposals && proposals.length > 0 && (
            <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{proposals.length} waiting</span>
          )}
        </div>
        {proposals === null ? (
          <p role="status" className="mt-4 text-[0.95rem] text-dim-foreground">
            Your proposals couldn&apos;t be read. Try again in a moment.
          </p>
        ) : proposals.length === 0 ? (
          <p className="mt-4 rounded-sm border border-dashed border-border-strong px-4 py-3.5 text-[0.95rem] text-dim-foreground">
            None waiting. A game you propose stays here until it&apos;s accepted or declined.
          </p>
        ) : (
          <ul>
            {proposals.map((p) => (
              <InboxRow key={p.id} game={p.game} note={p.note} meta={<span>Proposed {p.when} · waiting</span>} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
