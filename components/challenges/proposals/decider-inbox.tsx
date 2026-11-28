"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { ProposalView } from "@/lib/challenges/proposals";
import type { ChallengeListNotice } from "@/lib/challenges/types";
import { declineProposalAction, settleListNoticeAction } from "@/app/actions/pool-proposals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberMark } from "@/components/challenges/host-badge";
import { InboxRow } from "@/components/challenges/proposals/inbox-row";
import { AcceptDialog, type AcceptAs } from "@/components/challenges/proposals/accept-dialog";
import { NoticeRow } from "@/components/challenges/proposals/notice-row";

export interface InboxChallenge {
  id: number;
  name: string;
  list: { name: string; canAdd: boolean } | null;
  // Members with an active Run, who hear about a new Core Game.
  activeRuns: number;
}

// The Proposals view for whoever decides (the Host; Moderators and above),
// pick 9A: list notices at the top, then each pending proposal with Accept
// as Core, Accept as Optional (both open the Accept dialog) and Decline.
export function DeciderInbox({
  challenge,
  notices,
  proposals,
}: {
  challenge: InboxChallenge;
  notices: ChallengeListNotice[];
  proposals: ProposalView[] | null;
}) {
  const [accepting, setAccepting] = useState<{ proposal: ProposalView; as: AcceptAs } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const run = (job: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await job();
      if (!result.ok) setError(result.error ?? "That didn't save. Try again.");
    });
  const runs = challenge.activeRuns;
  const dm = runs > 0 ? ` sends a DM to the ${runs === 1 ? "member" : `${runs} members`} with an active Run` : " makes every Run Clear it";
  return (
    <div data-slot="proposals-panel" data-variant="inbox">
      <p className="mb-1.5 max-w-[75ch] text-[0.95rem] text-dim-foreground">
        Members propose games they think belong in the Pool. Accepting a game as Core{dm}; as Optional it arrives quietly.
      </p>
      {error && (
        <p role="alert" className="my-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <ul aria-label="Waiting for you">
        {notices.map((notice) => (
          <NoticeRow
            key={`n-${notice.id}`}
            notice={notice}
            listName={challenge.list?.name ?? "the Game List"}
            pending={pending}
            onSettle={(choice) => run(() => settleListNoticeAction(challenge.id, notice.id, choice))}
          />
        ))}
        {(proposals ?? []).map((proposal) => (
          <InboxRow
            key={proposal.id}
            game={proposal.game}
            note={proposal.note}
            meta={
              <>
                <MemberMark name={proposal.proposer.name} src={proposal.proposer.avatar} size={18} />
                <span>
                  Proposed by {proposal.proposer.name} · {proposal.when}
                </span>
                {proposal.leftOut && (
                  <Badge tone="outline" size="sm">
                    Left out by the Host
                  </Badge>
                )}
              </>
            }
            actions={
              <>
                <Button size="sm" variant="highlight" disabled={pending} onClick={() => setAccepting({ proposal, as: "core" })}>
                  <Plus aria-hidden />
                  Accept as Core
                </Button>
                <Button size="sm" variant="outline" disabled={pending} onClick={() => setAccepting({ proposal, as: "optional" })}>
                  Accept as Optional
                </Button>
                <Button size="sm" variant="destructive-outline" disabled={pending} onClick={() => run(() => declineProposalAction(challenge.id, proposal.id))}>
                  Decline
                </Button>
              </>
            }
          />
        ))}
      </ul>
      {proposals === null ? (
        <p role="status" className="mt-4 text-[0.95rem] text-dim-foreground">
          The proposals couldn&apos;t be read. Try again in a moment.
        </p>
      ) : (
        proposals.length === 0 &&
        notices.length === 0 && (
          <p className="mt-4 rounded-sm border border-dashed border-border-strong px-4 py-3.5 text-[0.95rem] text-dim-foreground">
            Nothing waiting. When a member proposes a game, it shows here and the Proposals tab gets a yellow count.
          </p>
        )
      )}
      <AcceptDialog
        proposal={accepting?.proposal ?? null}
        as={accepting?.as ?? "optional"}
        challenge={challenge}
        onClose={() => setAccepting(null)}
      />
    </div>
  );
}
