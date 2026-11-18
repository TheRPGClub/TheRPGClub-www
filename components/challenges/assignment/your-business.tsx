"use client";

import { ArrowRight } from "lucide-react";
import { formatDay } from "@/lib/challenges/dates";
import type { YourBusinessProps } from "@/lib/challenges/edition-client";
import { BACKLOG_MINIMUM } from "@/lib/challenges/edition-calendar";
import { ButtonLink } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { LeaveAfterDraw } from "@/components/challenges/assignment/leave-after-draw";
import { SignupPanel } from "@/components/challenges/assignment/signup-panel";
import { YellowPanel } from "@/components/challenges/assignment/yellow-panel";

// The viewer's own business in the side panel (surface brief
// challenges-assignment): sign up or leave while sign-up is open, go and
// pick while they are a Santa (or leave, which drops their pick and Abandons
// their Run), their game once it's revealed. It gets only the plain words
// lib/challenges/edition-client picks, never the picks themselves.
export function YourBusiness(props: YourBusinessProps) {
  const { phase, part, today } = props;
  if (phase === "signup") {
    if (!props.signupOpen) return null;
    return (
      <SignupPanel
        editionId={props.editionId}
        challengeName={props.challengeName}
        signupCutoffOn={props.signupCutoffOn}
        joined={part !== "out"}
        backlogCount={props.backlogCount}
        eligible={props.eligible}
        viewerId={props.viewerId}
        today={today}
      />
    );
  }
  if (phase === "picking" && part === "drawn") {
    const closed = props.picksClosed;
    const recipient = props.pickFor?.recipient ?? null;
    const picked = props.pickFor?.picked;
    const note = closed
      ? `Every game is revealed on ${formatDay(props.revealOn, today)}.`
      : picked
        ? `You picked ${picked}. You can change it until picks close on ${formatDay(props.pickDeadlineOn, today)}.`
        : null;
    return (
      <YellowPanel
        label="You are a Santa"
        title={closed ? "Your pick is in" : recipient ? `Pick for ${recipient}` : "Pick your game"}
        note={note}
      >
        {!closed && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <ButtonLink href={`/challenges/${props.challengeId}/pick?edition=${props.editionId}`} variant="inverse" size="sm">
              Open your pick page <ArrowRight aria-hidden />
            </ButtonLink>
            <LeaveAfterDraw editionId={props.editionId} year={props.year} recipient={recipient} />
          </div>
        )}
      </YellowPanel>
    );
  }
  if (part === "left-out") {
    return (
      <NoticeSlip title="Not this year" role="status">
        You weren&apos;t drawn: under {BACKLOG_MINIMUM} games in your backlog on{" "}
        {formatDay(props.signupCutoffOn, today)}.
      </NoticeSlip>
    );
  }
  if (part === "withdrawn") {
    return <p className="text-[0.92rem] text-faint-foreground">You left this Edition after the draw.</p>;
  }
  // Once the Edition ends, the Santa circle is the news, not the viewer's game.
  if (phase === "revealed" && props.yourGame) {
    return (
      <YellowPanel label="Your game" title={props.yourGame}>
        <ButtonLink href={`/members/${props.viewerId}#runs`} variant="inverse" size="sm">
          See your Run
        </ButtonLink>
      </YellowPanel>
    );
  }
  return null;
}
