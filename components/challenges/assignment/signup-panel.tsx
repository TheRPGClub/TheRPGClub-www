"use client";

import { useState, useTransition } from "react";
import { leaveEditionAction, signUpAction } from "@/app/actions/challenge-editions";
import { formatDay, type IsoDay } from "@/lib/challenges/dates";
import { BACKLOG_MINIMUM } from "@/lib/challenges/edition-calendar";
import { Button, ButtonLink } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { YellowPanel } from "@/components/challenges/assignment/yellow-panel";

// Signing up while sign-up is open (surface brief challenges-assignment): the
// yellow panel with the viewer's backlog size and Sign up, or Leave once
// they're in; a dashed panel instead when their backlog is under the
// minimum. A refusal (the API's words) shows in a notice slip under it.
export function SignupPanel({
  editionId,
  challengeName,
  signupCutoffOn,
  joined,
  backlogCount,
  eligible,
  viewerId,
  today,
}: {
  editionId: number;
  challengeName: string;
  signupCutoffOn: IsoDay;
  joined: boolean;
  backlogCount: number | null;
  eligible: boolean | null;
  viewerId: string;
  today: IsoDay;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const send = () =>
    startTransition(async () => {
      setError(null);
      const result = await (joined ? leaveEditionAction : signUpAction)(editionId);
      if (!result.ok) setError(result.error ?? "That didn't work. Try again.");
    });

  if (!joined && backlogCount !== null && eligible === false) {
    return (
      <div className="rounded-sm border border-dashed border-border-strong px-4 py-3.5 text-[0.92rem] leading-[1.45] text-dim-foreground">
        You need at least {BACKLOG_MINIMUM} games in your backlog to sign up (you have {backlogCount}).{" "}
        <ButtonLink href={`/members/${viewerId}/backlogged-games`} variant="link" size="inline">
          Go to your backlog
        </ButtonLink>
      </div>
    );
  }
  const label = joined
    ? "You're signed up"
    : backlogCount !== null
      ? `You have ${backlogCount} games in your backlog`
      : "Sign-up is open";
  return (
    <>
      <YellowPanel
        label={label}
        title={
          joined
            ? `You're in the draw on ${formatDay(signupCutoffOn, today)}`
            : `Sign up for ${challengeName}`
        }
      >
        <Button
          type="button"
          variant={joined ? "inverse-outline" : "inverse"}
          size="sm"
          disabled={pending}
          onClick={send}
        >
          {joined ? (pending ? "Leaving…" : "Leave") : pending ? "Signing up…" : "Sign up"}
        </Button>
      </YellowPanel>
      {error && (
        <NoticeSlip title={joined ? "Still signed up" : "Not signed up"} role="alert">
          {error}
        </NoticeSlip>
      )}
    </>
  );
}
