"use client";

import { ArrowRight } from "lucide-react";
import { formatDay, type IsoDay } from "@/lib/challenges/dates";
import { picksClosed, type YourPart } from "@/lib/challenges/edition";
import { BACKLOG_MINIMUM } from "@/lib/challenges/edition-calendar";
import { memberName } from "@/lib/challenges/runs";
import type { ChallengeEdition, SantaView } from "@/lib/challenges/types";
import { ButtonLink } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { LeaveAfterDraw } from "@/components/challenges/assignment/leave-after-draw";
import { SignupPanel } from "@/components/challenges/assignment/signup-panel";
import { YellowPanel } from "@/components/challenges/assignment/yellow-panel";

// The viewer's own business in the side panel (surface brief
// challenges-assignment): sign up or leave while sign-up is open, go and
// pick while they are a Santa (or leave, which drops their pick and Abandons
// their Run), their game once it's revealed.
export function YourBusiness({
  edition,
  part,
  backlogCount,
  santa,
  viewerId,
  today,
}: {
  edition: ChallengeEdition;
  part: YourPart;
  backlogCount: number | null;
  santa: SantaView | null;
  viewerId: string;
  today: IsoDay;
}) {
  if (edition.phase === "signup") {
    if (!edition.signup_open) return null;
    return (
      <SignupPanel
        edition={edition}
        joined={part !== "out"}
        backlogCount={backlogCount}
        viewerId={viewerId}
        today={today}
      />
    );
  }
  if (edition.phase === "picking" && part === "drawn") {
    const closed = picksClosed(edition, today);
    const recipient = santa ? memberName(santa.recipient) : null;
    const note = closed
      ? `Every game is revealed on ${formatDay(edition.reveal_on, today)}.`
      : santa?.pick
        ? `You picked ${santa.pick.game.title}. You can change it until picks close on ${formatDay(edition.pick_deadline_on, today)}.`
        : null;
    return (
      <YellowPanel
        label="You are a Santa"
        title={closed ? "Your pick is in" : recipient ? `Pick for ${recipient}` : "Pick your game"}
        note={note}
      >
        {!closed && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ButtonLink href={`/challenges/${edition.challenge.id}/pick`} variant="inverse" size="sm">
              Open your pick page <ArrowRight aria-hidden />
            </ButtonLink>
            <LeaveAfterDraw edition={edition} recipient={recipient} />
          </div>
        )}
      </YellowPanel>
    );
  }
  if (part === "left-out") {
    return (
      <NoticeSlip title="Not this year" role="status">
        You weren&apos;t drawn: under {BACKLOG_MINIMUM} games in your backlog on{" "}
        {formatDay(edition.signup_cutoff_on, today)}.
      </NoticeSlip>
    );
  }
  if (part === "withdrawn") {
    return <p className="text-[0.92rem] text-faint-foreground">You left this Edition after the draw.</p>;
  }
  const yours = edition.assignments?.find((a) => a.recipient.user_id === viewerId);
  if ((edition.phase === "revealed" || edition.phase === "ended") && yours?.game) {
    return (
      <YellowPanel label="Your game" title={yours.game.title}>
        <ButtonLink href={`/members/${viewerId}#runs`} variant="inverse" size="sm">
          See your Run
        </ButtonLink>
      </YellowPanel>
    );
  }
  return null;
}
