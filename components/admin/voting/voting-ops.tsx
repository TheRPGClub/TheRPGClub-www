"use client";

import { useState, type ReactNode } from "react";
import { SquareX } from "lucide-react";
import { closeVotingNowAction } from "@/app/actions/voting-console";
import type { VotingRound } from "@/lib/api/types";
import { TypedConfirmButton } from "@/components/admin/desk/typed-confirm";
import { Button } from "@/components/ui/button";

// One of the round's operations: a card with its icon and title.
export function Op({ icon: Icon, title, children }: { icon: typeof SquareX; title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-md bg-card px-3.5 py-3">
      <h2 className="font-label flex items-center gap-2 text-[0.95rem] font-extrabold tracking-[0.06em]">
        <Icon aria-hidden className="size-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function OpText({ children }: { children: ReactNode }) {
  return <p className="mt-0.75 mb-2.5 text-[0.84rem] leading-[1.4] text-dim-foreground">{children}</p>;
}

export function OpNote({ children }: { children: ReactNode }) {
  return <span className="text-[0.8rem] text-faint-foreground">{children}</span>;
}

export function CloseNowOp({ round }: { round: VotingRound }) {
  const n = round.round_number;
  const [done, setDone] = useState(false);
  return (
    <Op icon={SquareX} title="Close voting now">
      <OpText>Ends the vote early. Asks you to type the round number.</OpText>
      <div className="flex flex-wrap items-center gap-2">
        {round.voting_open ? (
          <TypedConfirmButton
            triggerLabel={`Close Round ${n}`}
            question={`Close voting for Round ${n} now?`}
            words={`CLOSE ROUND ${n}`}
            actionLabel="Close voting"
            onConfirm={async () => {
              const result = await closeVotingNowAction(n);
              if (!result.ok) return { error: result.error };
              setDone(true);
            }}
          >
            Members can&apos;t vote after this. The bot posts the results within seconds.
          </TypedConfirmButton>
        ) : (
          <>
            <Button type="button" variant="destructive-outline" size="sm" disabled>
              Close Round {n}
            </Button>
            <OpNote>{round.voting_ended ? "Voting has closed" : "While voting is open"}</OpNote>
          </>
        )}
      </div>
      {done && (
        <p role="status" className="mt-2 text-[0.84rem] text-dim-foreground">
          Voting for Round {n} is closed.
        </p>
      )}
    </Op>
  );
}
